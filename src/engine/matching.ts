import { Profile, Internship, Skill } from '../types/database';
import {
  EligibilityCheck,
  EligibilityStatus,
  MatchExplanation,
  MatchWeights,
  RecommendationTier,
  SkillMatchResult,
  EvidenceBreakdown,
} from '../types/matching';

/**
 * Skill Aliases and Normalization Dictionary
 */
const SKILL_ALIASES: Record<string, string> = {
  'react.js': 'react',
  'reactjs': 'react',
  'node.js': 'node',
  'nodejs': 'node',
  'ts': 'typescript',
  'js': 'javascript',
  'golang': 'go',
  'py': 'python',
  'postgres': 'postgresql',
  'psql': 'postgresql',
  'tailwind': 'tailwindcss',
  'docker containerization': 'docker',
  'next': 'nextjs',
  'next.js': 'nextjs',
  'vue.js': 'vue',
  'vuejs': 'vue',
};

/**
 * Normalize skill name: lowercase, trim, remove non-alphanumeric trailing, map aliases
 */
export function normalizeSkill(name: string): string {
  if (!name) return '';
  const cleaned = name.trim().toLowerCase();
  return SKILL_ALIASES[cleaned] || cleaned;
}

/**
 * Default Configurable Matching Weights
 */
export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  requiredSkills: 0.45,
  preferredSkills: 0.15,
  evidence: 0.20,
  roleInterest: 0.10,
  preferences: 0.10,
};

/**
 * Evaluate Hard Eligibility Criteria
 */
export function evaluateEligibility(student: Profile, internship: Internship): {
  status: EligibilityStatus;
  checks: EligibilityCheck[];
} {
  const checks: EligibilityCheck[] = [];

  // 1. Graduation Year Check
  if (internship.eligible_grad_years && internship.eligible_grad_years.length > 0) {
    if (student.graduation_year === undefined || student.graduation_year === null) {
      checks.push({
        criterion: 'graduation_year',
        name: 'Graduation Year',
        status: 'unknown',
        reason: 'Student graduation year not specified in profile.',
        requiredValue: internship.eligible_grad_years.map(String),
        studentValue: null,
      });
    } else if (internship.eligible_grad_years.includes(student.graduation_year)) {
      checks.push({
        criterion: 'graduation_year',
        name: 'Graduation Year',
        status: 'eligible',
        reason: `Graduation year (${student.graduation_year}) matches required years.`,
        requiredValue: internship.eligible_grad_years.map(String),
        studentValue: student.graduation_year,
      });
    } else {
      checks.push({
        criterion: 'graduation_year',
        name: 'Graduation Year',
        status: 'ineligible',
        reason: `Graduation year (${student.graduation_year}) is not in accepted list [${internship.eligible_grad_years.join(', ')}].`,
        requiredValue: internship.eligible_grad_years.map(String),
        studentValue: student.graduation_year,
      });
    }
  }

  // 2. Academic Year Check (Minimum Year)
  if (internship.eligible_min_year && internship.eligible_min_year > 0) {
    if (student.current_year === undefined || student.current_year === null) {
      checks.push({
        criterion: 'minimum_year',
        name: 'Minimum Academic Year',
        status: 'unknown',
        reason: 'Student current year of study not specified in profile.',
        requiredValue: `Year ${internship.eligible_min_year}+`,
        studentValue: null,
      });
    } else if (student.current_year >= internship.eligible_min_year) {
      checks.push({
        criterion: 'minimum_year',
        name: 'Minimum Academic Year',
        status: 'eligible',
        reason: `Student is in Year ${student.current_year} (Requirement: Year ${internship.eligible_min_year}+).`,
        requiredValue: `Year ${internship.eligible_min_year}+`,
        studentValue: `Year ${student.current_year}`,
      });
    } else {
      checks.push({
        criterion: 'minimum_year',
        name: 'Minimum Academic Year',
        status: 'ineligible',
        reason: `Student is in Year ${student.current_year}, below minimum Year ${internship.eligible_min_year}.`,
        requiredValue: `Year ${internship.eligible_min_year}+`,
        studentValue: `Year ${student.current_year}`,
      });
    }
  }

  // 3. Degree Match Check
  if (internship.eligible_degrees && internship.eligible_degrees.length > 0) {
    if (!student.degree) {
      checks.push({
        criterion: 'degree',
        name: 'Eligible Degrees',
        status: 'unknown',
        reason: 'Student degree not specified in profile.',
        requiredValue: internship.eligible_degrees,
        studentValue: null,
      });
    } else {
      const studentDeg = student.degree.trim().toLowerCase();
      const isDegreeEligible = internship.eligible_degrees.some(
        (deg) => deg.trim().toLowerCase() === studentDeg || studentDeg.includes(deg.trim().toLowerCase())
      );

      if (isDegreeEligible) {
        checks.push({
          criterion: 'degree',
          name: 'Eligible Degrees',
          status: 'eligible',
          reason: `Degree (${student.degree}) matches eligible programs.`,
          requiredValue: internship.eligible_degrees,
          studentValue: student.degree,
        });
      } else {
        checks.push({
          criterion: 'degree',
          name: 'Eligible Degrees',
          status: 'ineligible',
          reason: `Degree (${student.degree}) is not in accepted programs: ${internship.eligible_degrees.join(', ')}.`,
          requiredValue: internship.eligible_degrees,
          studentValue: student.degree,
        });
      }
    }
  }

  // Overall status resolution:
  // If ANY check is ineligible -> 'ineligible'
  // Else if ANY check is unknown -> 'unknown'
  // Else -> 'eligible'
  let overallStatus: EligibilityStatus = 'eligible';
  if (checks.some((c) => c.status === 'ineligible')) {
    overallStatus = 'ineligible';
  } else if (checks.some((c) => c.status === 'unknown')) {
    overallStatus = 'unknown';
  }

  return { status: overallStatus, checks };
}

/**
 * Match Skills (Required & Preferred)
 */
export function evaluateSkills(student: Profile, internship: Internship): SkillMatchResult {
  const studentSkillNorms = new Set(
    (student.skills || []).map((ps) => normalizeSkill(ps.skill?.name || ''))
  );

  const matchedRequired: Skill[] = [];
  const missingRequired: Skill[] = [];

  for (const skill of internship.required_skills || []) {
    const norm = normalizeSkill(skill.name);
    if (studentSkillNorms.has(norm)) {
      matchedRequired.push(skill);
    } else {
      missingRequired.push(skill);
    }
  }

  const matchedPreferred: Skill[] = [];
  const missingPreferred: Skill[] = [];

  for (const skill of internship.preferred_skills || []) {
    const norm = normalizeSkill(skill.name);
    if (studentSkillNorms.has(norm)) {
      matchedPreferred.push(skill);
    } else {
      missingPreferred.push(skill);
    }
  }

  const reqTotal = (internship.required_skills || []).length;
  const prefTotal = (internship.preferred_skills || []).length;

  const requiredMatchRatio = reqTotal === 0 ? 1 : matchedRequired.length / reqTotal;
  const preferredMatchRatio = prefTotal === 0 ? 1 : matchedPreferred.length / prefTotal;

  // Weighted skill component: 75% required, 25% preferred
  const overallSkillScore = Math.round(
    (requiredMatchRatio * 0.75 + preferredMatchRatio * 0.25) * 100
  );

  return {
    matchedRequired,
    matchedPreferred,
    missingRequired,
    missingPreferred,
    requiredMatchRatio,
    preferredMatchRatio,
    overallSkillScore,
  };
}

/**
 * Evaluate Demonstrated Evidence from Projects & Hackathons
 */
export function evaluateEvidence(
  student: Profile,
  matchedSkills: Skill[]
): EvidenceBreakdown {
  const matchedSkillNorms = new Set(matchedSkills.map((s) => normalizeSkill(s.name)));
  const verifiedSkillsFound = new Set<string>();

  const relevantProjects: EvidenceBreakdown['relevantProjects'] = [];
  for (const proj of student.projects || []) {
    const demonstrated: string[] = [];
    for (const s of proj.skills || []) {
      const norm = normalizeSkill(s.name);
      if (matchedSkillNorms.has(norm)) {
        demonstrated.push(s.name);
        verifiedSkillsFound.add(norm);
      }
    }
    if (demonstrated.length > 0) {
      relevantProjects.push({
        project: proj,
        demonstratedSkills: demonstrated,
      });
    }
  }

  const relevantHackathons: EvidenceBreakdown['relevantHackathons'] = [];
  for (const hack of student.hackathons || []) {
    const demonstrated: string[] = [];
    for (const s of hack.skills || []) {
      const norm = normalizeSkill(s.name);
      if (matchedSkillNorms.has(norm)) {
        demonstrated.push(s.name);
        verifiedSkillsFound.add(norm);
      }
    }
    if (demonstrated.length > 0) {
      relevantHackathons.push({
        hackathon: hack,
        demonstratedSkills: demonstrated,
      });
    }
  }

  const totalMatchedCount = matchedSkills.length;
  let evidenceScore = 0;

  if (totalMatchedCount > 0) {
    const ratio = verifiedSkillsFound.size / totalMatchedCount;
    // Base score from coverage, plus bonus if projects or hackathons exist
    const projectBonus = relevantProjects.length > 0 ? 10 : 0;
    const hackathonBonus = relevantHackathons.length > 0 ? 10 : 0;
    evidenceScore = Math.min(100, Math.round(ratio * 80 + projectBonus + hackathonBonus));
  } else if ((student.projects || []).length > 0 || (student.hackathons || []).length > 0) {
    evidenceScore = 20; // Some general evidence exists
  }

  return {
    relevantProjects,
    relevantHackathons,
    skillsWithEvidenceCount: verifiedSkillsFound.size,
    evidenceScore,
  };
}

/**
 * Evaluate Role & Preference Fit
 */
export function evaluatePreferences(student: Profile, internship: Internship): {
  roleInterestScore: number;
  preferenceScore: number;
} {
  // Role & Domain Alignment
  let roleInterestScore = 50; // Neutral baseline
  const titleWords = internship.title.toLowerCase().split(/\s+/);
  const preferredRoles = (student.preferred_roles || []).map((r) => r.toLowerCase());

  if (preferredRoles.length > 0) {
    const directRoleMatch = preferredRoles.some((pref) =>
      titleWords.some((w) => w.length > 2 && pref.includes(w)) ||
      internship.title.toLowerCase().includes(pref) ||
      internship.description.toLowerCase().includes(pref)
    );
    roleInterestScore = directRoleMatch ? 100 : 40;
  }

  // Work Mode & Location Alignment
  let preferenceScore = 50;
  const prefModes = student.preferred_work_modes || [];
  if (prefModes.length > 0) {
    if (prefModes.includes(internship.work_mode)) {
      preferenceScore = 100;
    } else if (internship.work_mode === 'remote') {
      preferenceScore = 80; // Remote is usually adaptable
    } else {
      preferenceScore = 30; // Work mode mismatch
    }
  }

  // Check preferred locations if on-site or hybrid
  if (internship.work_mode !== 'remote' && student.preferred_locations && student.preferred_locations.length > 0) {
    const locMatch = student.preferred_locations.some((loc) =>
      internship.location.toLowerCase().includes(loc.toLowerCase())
    );
    if (!locMatch) {
      preferenceScore = Math.max(20, preferenceScore - 20);
    }
  }

  return { roleInterestScore, preferenceScore };
}

/**
 * Generate Plain-Language Explanation of Match
 */
function generatePlainExplanation(
  _student: Profile,
  internship: Internship,
  eligibility: { status: EligibilityStatus; checks: EligibilityCheck[] },
  skillMatch: SkillMatchResult,
  evidence: EvidenceBreakdown,
  overallScore: number
): { text: string; strengths: string[]; gaps: string[] } {
  const strengths: string[] = [];
  const gaps: string[] = [];

  const reqTotal = (internship.required_skills || []).length;
  const matchedReqCount = skillMatch.matchedRequired.length;

  if (matchedReqCount > 0) {
    strengths.push(
      `Matches ${matchedReqCount} of ${reqTotal} mandatory skill${reqTotal === 1 ? '' : 's'} (${skillMatch.matchedRequired.map((s) => s.name).join(', ')})`
    );
  }

  if (skillMatch.matchedPreferred.length > 0) {
    strengths.push(
      `Has preferred qualification${skillMatch.matchedPreferred.length === 1 ? '' : 's'}: ${skillMatch.matchedPreferred.map((s) => s.name).join(', ')}`
    );
  }

  if (evidence.relevantProjects.length > 0) {
    const projectTitles = evidence.relevantProjects.map((p) => `"${p.project.title}"`).slice(0, 2).join(' and ');
    strengths.push(`Demonstrated relevant skills through project work (${projectTitles})`);
  }

  if (evidence.relevantHackathons.length > 0) {
    const hackNames = evidence.relevantHackathons.map((h) => h.hackathon.event_name).slice(0, 2).join(', ');
    strengths.push(`Applied skills in hackathons: ${hackNames}`);
  }

  if (skillMatch.missingRequired.length > 0) {
    gaps.push(
      `Missing required skill${skillMatch.missingRequired.length === 1 ? '' : 's'}: ${skillMatch.missingRequired.map((s) => s.name).join(', ')}`
    );
  }

  if (skillMatch.missingPreferred.length > 0) {
    gaps.push(
      `Could strengthen candidate profile with: ${skillMatch.missingPreferred.map((s) => s.name).join(', ')}`
    );
  }

  // Eligibility notes
  const failedChecks = eligibility.checks.filter((c) => c.status === 'ineligible');
  const unknownChecks = eligibility.checks.filter((c) => c.status === 'unknown');

  for (const check of failedChecks) {
    gaps.push(`Eligibility issue: ${check.reason}`);
  }
  for (const check of unknownChecks) {
    gaps.push(`Unconfirmed criteria: ${check.reason}`);
  }

  // Construct comprehensive explanation paragraph
  let text = '';
  if (eligibility.status === 'ineligible') {
    text = `This candidate does not meet one or more hard eligibility requirements for ${internship.title} at ${internship.organization} (${failedChecks.map((f) => f.reason).join('; ')}). While their technical skill alignment scores ${skillMatch.overallSkillScore}%, the role has explicit criteria that currently exclude this profile.`;
  } else if (overallScore >= 80) {
    text = `Strong match for ${internship.title} at ${internship.organization}. The profile satisfies ${matchedReqCount}/${reqTotal} required technical capabilities, supported by practical project and hackathon deliverables. ${gaps.length > 0 ? `Minor area to explore: ${gaps[0]}.` : 'All key qualifications are covered.'}`;
  } else if (overallScore >= 60) {
    text = `Solid candidate with high potential for ${internship.title}. Demonstrates core proficiency in ${matchedReqCount > 0 ? skillMatch.matchedRequired.map((s) => s.name).join(', ') : 'related domains'}, with opportunity to bridge ${skillMatch.missingRequired.length > 0 ? skillMatch.missingRequired.map((s) => s.name).join(', ') : 'certain preferred requirements'}.`;
  } else if (overallScore >= 40) {
    text = `Partial match for ${internship.title}. While the candidate expresses relevant interest, several foundational skills (${skillMatch.missingRequired.map((s) => s.name).join(', ') || 'required skills'}) are not yet documented in their portfolio.`;
  } else {
    text = `Limited alignment with current requirements for ${internship.title}. Multiple core technologies are not found in the candidate's verified profile or project evidence.`;
  }

  if (eligibility.status === 'unknown' && unknownChecks.length > 0) {
    text += ` Note: ${unknownChecks.map((u) => u.name).join(', ')} must be verified before proceeding.`;
  }

  return { text, strengths, gaps };
}

/**
 * Determine Recommendation Tier
 */
function getRecommendationTier(score: number, eligibility: EligibilityStatus): RecommendationTier {
  if (eligibility === 'ineligible') {
    return 'Not Eligible';
  }
  if (score >= 80) return 'Strong Match';
  if (score >= 65) return 'Good Match';
  if (score >= 45) return 'Potential Match';
  return 'Limited Match';
}

/**
 * Main Deterministic Matching Calculation
 */
export function calculateMatch(
  student: Profile,
  internship: Internship,
  weights: MatchWeights = DEFAULT_MATCH_WEIGHTS
): MatchExplanation {
  // 1. Hard Eligibility
  const eligibility = evaluateEligibility(student, internship);

  // 2. Skill Alignment
  const skillMatch = evaluateSkills(student, internship);

  // 3. Demonstrated Evidence
  const allMatchedSkills = [...skillMatch.matchedRequired, ...skillMatch.matchedPreferred];
  const evidenceBreakdown = evaluateEvidence(student, allMatchedSkills);

  // 4. Role and Preferences
  const { roleInterestScore, preferenceScore } = evaluatePreferences(student, internship);

  // 5. Overall Weighted Fit Score (0 - 100)
  // Skill match (required + preferred) accounts for weights.requiredSkills & weights.preferredSkills
  const rawSkillScore =
    skillMatch.requiredMatchRatio * 100 * weights.requiredSkills +
    skillMatch.preferredMatchRatio * 100 * weights.preferredSkills;

  const rawEvidenceScore = evidenceBreakdown.evidenceScore * weights.evidence;
  const rawRoleScore = roleInterestScore * weights.roleInterest;
  const rawPrefScore = preferenceScore * weights.preferences;

  let overallScore = Math.round(rawSkillScore + rawEvidenceScore + rawRoleScore + rawPrefScore);
  overallScore = Math.max(0, Math.min(100, overallScore));

  // 6. Plain-Language Explanation & Tiers
  const { text, strengths, gaps } = generatePlainExplanation(
    student,
    internship,
    eligibility,
    skillMatch,
    evidenceBreakdown,
    overallScore
  );

  const recommendationTier = getRecommendationTier(overallScore, eligibility.status);

  return {
    overallScore,
    eligibilityStatus: eligibility.status,
    eligibilityChecks: eligibility.checks,
    skillMatch,
    evidenceBreakdown,
    roleInterestScore,
    preferenceScore,
    plainTextExplanation: text,
    strengths,
    skillGaps: gaps,
    recommendationTier,
    calculationWeights: weights,
  };
}

/**
 * Rank internships for a student, returning sorted list with explanations
 */
export function rankInternshipsForStudent(
  student: Profile,
  internships: Internship[],
  weights: MatchWeights = DEFAULT_MATCH_WEIGHTS
): Array<{ internship: Internship; match: MatchExplanation }> {
  const ranked = internships.map((internship) => ({
    internship,
    match: calculateMatch(student, internship, weights),
  }));

  // Sort: Eligible & Unknown first, then by overallScore descending, then by title
  return ranked.sort((a, b) => {
    // If one is ineligible and other is eligible/unknown, prioritize eligible
    if (a.match.eligibilityStatus === 'ineligible' && b.match.eligibilityStatus !== 'ineligible') {
      return 1;
    }
    if (b.match.eligibilityStatus === 'ineligible' && a.match.eligibilityStatus !== 'ineligible') {
      return -1;
    }

    if (b.match.overallScore !== a.match.overallScore) {
      return b.match.overallScore - a.match.overallScore;
    }
    return a.internship.title.localeCompare(b.internship.title);
  });
}

/**
 * Rank candidates for a recruiter's internship listing
 */
export function rankCandidatesForInternship(
  internship: Internship,
  candidates: Profile[],
  weights: MatchWeights = DEFAULT_MATCH_WEIGHTS
): Array<{ candidate: Profile; match: MatchExplanation }> {
  const ranked = candidates.map((candidate) => ({
    candidate,
    match: calculateMatch(candidate, internship, weights),
  }));

  return ranked.sort((a, b) => {
    if (a.match.eligibilityStatus === 'ineligible' && b.match.eligibilityStatus !== 'ineligible') {
      return 1;
    }
    if (b.match.eligibilityStatus === 'ineligible' && a.match.eligibilityStatus !== 'ineligible') {
      return -1;
    }

    if (b.match.overallScore !== a.match.overallScore) {
      return b.match.overallScore - a.match.overallScore;
    }
    return a.candidate.full_name.localeCompare(b.candidate.full_name);
  });
}
