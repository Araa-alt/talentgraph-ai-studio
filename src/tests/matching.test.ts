import { describe, it, expect } from 'vitest';
import {
  normalizeSkill,
  evaluateEligibility,
  calculateMatch,
  rankInternshipsForStudent,
  rankCandidatesForInternship,
} from '../engine/matching';
import { Profile, Internship, Skill } from '../types/database';

describe('Skill Normalization', () => {
  it('normalizes common aliases accurately', () => {
    expect(normalizeSkill('React.js')).toBe('react');
    expect(normalizeSkill('ReactJS')).toBe('react');
    expect(normalizeSkill('  TS ')).toBe('typescript');
    expect(normalizeSkill('Postgres')).toBe('postgresql');
    expect(normalizeSkill('Tailwind')).toBe('tailwindcss');
    expect(normalizeSkill('Docker Containerization')).toBe('docker');
  });

  it('handles empty or malformed strings gracefully', () => {
    expect(normalizeSkill('')).toBe('');
    expect(normalizeSkill('   ')).toBe('');
  });
});

describe('Eligibility Evaluation', () => {
  const baseInternship: Internship = {
    id: 'int-1',
    recruiter_id: 'rec-1',
    title: 'Frontend Engineer Intern',
    organization: 'TechCorp',
    description: 'Build web interfaces.',
    responsibilities: ['Write code'],
    location: 'Bangalore',
    work_mode: 'remote',
    duration: '6 Months',
    application_url: 'https://example.com/apply',
    status: 'active',
    eligible_degrees: ['B.Tech', 'B.E.', 'BS in Computer Science'],
    eligible_grad_years: [2026, 2027],
    eligible_min_year: 3,
    required_skills: [],
    preferred_skills: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const fullyEligibleStudent: Profile = {
    id: 'stud-1',
    email: 'alex@example.edu',
    role: 'student',
    full_name: 'Alex Rivera',
    institution: 'Apex Tech University',
    degree: 'B.Tech in Computer Science',
    current_year: 3,
    graduation_year: 2026,
    preferred_roles: ['Frontend Developer'],
    preferred_locations: ['Bangalore'],
    preferred_work_modes: ['remote'],
    skills: [],
    projects: [],
    hackathons: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('marks student eligible when all criteria match', () => {
    const res = evaluateEligibility(fullyEligibleStudent, baseInternship);
    expect(res.status).toBe('eligible');
    expect(res.checks.every((c) => c.status === 'eligible')).toBe(true);
  });

  it('detects mandatory graduation year failure', () => {
    const studentWrongYear = { ...fullyEligibleStudent, graduation_year: 2024 };
    const res = evaluateEligibility(studentWrongYear, baseInternship);
    expect(res.status).toBe('ineligible');
    const gradCheck = res.checks.find((c) => c.criterion === 'graduation_year');
    expect(gradCheck?.status).toBe('ineligible');
  });

  it('detects academic year below minimum', () => {
    const studentTooYoung = { ...fullyEligibleStudent, current_year: 1 };
    const res = evaluateEligibility(studentTooYoung, baseInternship);
    expect(res.status).toBe('ineligible');
    const yearCheck = res.checks.find((c) => c.criterion === 'minimum_year');
    expect(yearCheck?.status).toBe('ineligible');
  });

  it('marks unknown when required fields are missing in profile', () => {
    const incompleteStudent = {
      ...fullyEligibleStudent,
      graduation_year: undefined,
      degree: undefined,
    };
    const res = evaluateEligibility(incompleteStudent, baseInternship);
    expect(res.status).toBe('unknown');
    expect(res.checks.some((c) => c.status === 'unknown')).toBe(true);
  });
});

describe('Full Matching Calculations & Explanations', () => {
  const reactSkill: Skill = { id: 's1', name: 'React', normalized_name: 'react' };
  const tsSkill: Skill = { id: 's2', name: 'TypeScript', normalized_name: 'typescript' };
  const nodeSkill: Skill = { id: 's3', name: 'Node.js', normalized_name: 'node' };
  const dockerSkill: Skill = { id: 's4', name: 'Docker', normalized_name: 'docker' };

  const testInternship: Internship = {
    id: 'int-2',
    recruiter_id: 'rec-1',
    title: 'Full Stack Web Intern',
    organization: 'Acme Cloud Labs',
    description: 'Work on React and Node.js microservices',
    responsibilities: ['Build APIs', 'Implement UI'],
    location: 'Remote',
    work_mode: 'remote',
    duration: '3 Months',
    application_url: 'https://acme.example.com/apply',
    status: 'active',
    eligible_degrees: ['B.Tech', 'BCA', 'MCA'],
    eligible_grad_years: [2026, 2027],
    eligible_min_year: 2,
    required_skills: [reactSkill, tsSkill, nodeSkill],
    preferred_skills: [dockerSkill],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const studentWithProjects: Profile = {
    id: 'stud-2',
    email: 'sarah@example.edu',
    role: 'student',
    full_name: 'Sarah Chen',
    institution: 'Tech Institute',
    degree: 'B.Tech',
    current_year: 3,
    graduation_year: 2026,
    preferred_roles: ['Full Stack Developer', 'Software Engineer'],
    preferred_locations: ['Remote'],
    preferred_work_modes: ['remote'],
    skills: [
      {
        profile_id: 'stud-2',
        skill_id: 's1',
        skill: { id: 's1', name: 'React.js', normalized_name: 'react' },
        proficiency_level: 'advanced',
        evidence_type: 'project_backed',
      },
      {
        profile_id: 'stud-2',
        skill_id: 's2',
        skill: { id: 's2', name: 'TS', normalized_name: 'typescript' },
        proficiency_level: 'intermediate',
        evidence_type: 'project_backed',
      },
      {
        profile_id: 'stud-2',
        skill_id: 's3',
        skill: { id: 's3', name: 'NodeJS', normalized_name: 'node' },
        proficiency_level: 'intermediate',
        evidence_type: 'hackathon_backed',
      },
    ],
    projects: [
      {
        id: 'p1',
        profile_id: 'stud-2',
        title: 'OpenTask Management Platform',
        description: 'Collaborative task planner with real-time sync',
        role: 'Full Stack Lead',
        contribution: 'Engineered frontend in React and TypeScript',
        skills: [reactSkill, tsSkill],
        repo_url: 'https://github.com/sarah/opentask',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    hackathons: [
      {
        id: 'h1',
        profile_id: 'stud-2',
        event_name: 'HackSprint 2026',
        project_name: 'SyncFlow',
        role: 'Backend Architect',
        contribution: 'Built Node.js event broker',
        achievement: 'Winner - Best Technical Architecture',
        skills: [nodeSkill],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('calculates strong match when student meets all required skills with evidence', () => {
    const match = calculateMatch(studentWithProjects, testInternship);

    expect(match.overallScore).toBeGreaterThanOrEqual(80);
    expect(match.eligibilityStatus).toBe('eligible');
    expect(match.skillMatch.matchedRequired.length).toBe(3);
    expect(match.skillMatch.missingRequired.length).toBe(0);
    expect(match.evidenceBreakdown.relevantProjects.length).toBe(1);
    expect(match.evidenceBreakdown.relevantHackathons.length).toBe(1);
    expect(match.recommendationTier).toBe('Strong Match');
    expect(match.plainTextExplanation).toContain('Strong match');
  });

  it('handles partial skill match with transparent missing skill warnings', () => {
    const partialStudent: Profile = {
      ...studentWithProjects,
      skills: [
        {
          profile_id: 'stud-2',
          skill_id: 's1',
          skill: reactSkill,
          proficiency_level: 'intermediate',
          evidence_type: 'self_declared',
        },
      ],
      projects: [],
      hackathons: [],
    };

    const match = calculateMatch(partialStudent, testInternship);
    expect(match.skillMatch.matchedRequired.length).toBe(1);
    expect(match.skillMatch.missingRequired.length).toBe(2);
    expect(match.overallScore).toBeLessThan(65);
    expect(match.skillGaps.some((g) => g.includes('Missing required skill'))).toBe(true);
  });

  it('reports correct tier and flags when hard eligibility fails', () => {
    const ineligibleStudent: Profile = {
      ...studentWithProjects,
      graduation_year: 2023, // Ineligible year
    };

    const match = calculateMatch(ineligibleStudent, testInternship);
    expect(match.eligibilityStatus).toBe('ineligible');
    expect(match.recommendationTier).toBe('Not Eligible');
    expect(match.plainTextExplanation).toContain('does not meet one or more hard eligibility requirements');
  });

  it('ranks internships stably prioritizing eligible over ineligible', () => {
    const eligibleListing = { ...testInternship, id: 'el-1', title: 'A Good Role' };
    const ineligibleListing = {
      ...testInternship,
      id: 'inel-1',
      title: 'Senior Role (2023 Grads Only)',
      eligible_grad_years: [2023],
    };

    const ranked = rankInternshipsForStudent(studentWithProjects, [
      ineligibleListing,
      eligibleListing,
    ]);

    expect(ranked[0].internship.id).toBe('el-1');
    expect(ranked[0].match.eligibilityStatus).toBe('eligible');
    expect(ranked[1].internship.id).toBe('inel-1');
    expect(ranked[1].match.eligibilityStatus).toBe('ineligible');
  });

  it('ranks candidates stably for recruiter listing', () => {
    const strongCandidate = studentWithProjects;
    const weakCandidate: Profile = {
      ...studentWithProjects,
      id: 'weak-1',
      full_name: 'Zoe Weak',
      skills: [],
      projects: [],
      hackathons: [],
    };

    const ranked = rankCandidatesForInternship(testInternship, [
      weakCandidate,
      strongCandidate,
    ]);

    expect(ranked[0].candidate.id).toBe(strongCandidate.id);
    expect(ranked[0].match.overallScore).toBeGreaterThan(ranked[1].match.overallScore);
  });
});
