import { Skill, Profile, Internship, Application, SavedInternship, RecruiterShortlist } from '../types/database';

export const INITIAL_SKILLS: Skill[] = [
  { id: 'skill-react', name: 'React', category: 'Frontend', normalized_name: 'react' },
  { id: 'skill-ts', name: 'TypeScript', category: 'Language', normalized_name: 'typescript' },
  { id: 'skill-node', name: 'Node.js', category: 'Backend', normalized_name: 'node' },
  { id: 'skill-postgres', name: 'PostgreSQL', category: 'Database', normalized_name: 'postgresql' },
  { id: 'skill-python', name: 'Python', category: 'Language', normalized_name: 'python' },
  { id: 'skill-tailwind', name: 'Tailwind CSS', category: 'Frontend', normalized_name: 'tailwindcss' },
  { id: 'skill-docker', name: 'Docker', category: 'DevOps', normalized_name: 'docker' },
  { id: 'skill-graphql', name: 'GraphQL', category: 'Backend', normalized_name: 'graphql' },
  { id: 'skill-ml', name: 'Machine Learning', category: 'Data Science', normalized_name: 'machine learning' },
  { id: 'skill-nextjs', name: 'Next.js', category: 'Frontend', normalized_name: 'nextjs' },
  { id: 'skill-flutter', name: 'Flutter', category: 'Mobile', normalized_name: 'flutter' },
  { id: 'skill-git', name: 'Git & GitHub', category: 'DevOps', normalized_name: 'git' },
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'stud-alex-1',
    email: 'alex.rivera@demo.talentgraph.io',
    role: 'student',
    full_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    institution: 'Apex Institute of Technology',
    degree: 'B.Tech',
    field_of_study: 'Computer Science & Engineering',
    current_year: 3,
    graduation_year: 2026,
    bio: 'Undergraduate software engineer passionate about reactive user interfaces, component design systems, and web performance.',
    preferred_roles: ['Frontend Engineer', 'Full Stack Developer', 'Software Engineer Intern'],
    preferred_locations: ['Bangalore', 'Remote', 'Hyderabad'],
    preferred_work_modes: ['remote', 'hybrid'],
    github_url: 'https://github.com/alexrivera-demo',
    portfolio_url: 'https://alexrivera.dev',
    skills: [
      {
        profile_id: 'stud-alex-1',
        skill_id: 'skill-react',
        skill: INITIAL_SKILLS[0],
        proficiency_level: 'advanced',
        evidence_type: 'project_backed',
        evidence_count: 2,
      },
      {
        profile_id: 'stud-alex-1',
        skill_id: 'skill-ts',
        skill: INITIAL_SKILLS[1],
        proficiency_level: 'advanced',
        evidence_type: 'project_backed',
        evidence_count: 2,
      },
      {
        profile_id: 'stud-alex-1',
        skill_id: 'skill-tailwind',
        skill: INITIAL_SKILLS[5],
        proficiency_level: 'advanced',
        evidence_type: 'project_backed',
        evidence_count: 1,
      },
      {
        profile_id: 'stud-alex-1',
        skill_id: 'skill-node',
        skill: INITIAL_SKILLS[2],
        proficiency_level: 'intermediate',
        evidence_type: 'hackathon_backed',
        evidence_count: 1,
      },
      {
        profile_id: 'stud-alex-1',
        skill_id: 'skill-nextjs',
        skill: INITIAL_SKILLS[9],
        proficiency_level: 'intermediate',
        evidence_type: 'self_declared',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        profile_id: 'stud-alex-1',
        title: 'OpenTask Workspace Platform',
        description: 'Interactive Kanban workspace with optimistic UI updates and real-time state synchronization.',
        role: 'Frontend Architect',
        contribution: 'Engineered type-safe state machine in TypeScript and created 24 accessible React design system components.',
        outcomes: 'Used by 150+ students for semester capstone tracking. 99.8% crash-free sessions.',
        repo_url: 'https://github.com/alexrivera-demo/opentask',
        live_url: 'https://opentask-demo.vercel.app',
        skills: [INITIAL_SKILLS[0], INITIAL_SKILLS[1], INITIAL_SKILLS[5]],
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      },
      {
        id: 'proj-2',
        profile_id: 'stud-alex-1',
        title: 'PulseUI Component Library',
        description: 'Zero-runtime CSS React design kit compliant with WCAG 2.1 AA contrast requirements.',
        role: 'Lead Author',
        contribution: 'Implemented accessible keyboard trap navigation, focus indicators, and screen reader announcements.',
        outcomes: 'Published to npm registry with over 1,200 total downloads.',
        repo_url: 'https://github.com/alexrivera-demo/pulse-ui',
        skills: [INITIAL_SKILLS[0], INITIAL_SKILLS[1]],
        created_at: '2025-11-20T10:00:00Z',
        updated_at: '2025-11-20T10:00:00Z',
      },
    ],
    hackathons: [
      {
        id: 'hack-1',
        profile_id: 'stud-alex-1',
        event_name: 'HackVerse National 2026',
        project_name: 'HealthSync Alert Router',
        role: 'Full Stack Developer',
        contribution: 'Architected Node.js push-event distributor and connected live telemetry to a React dashboard.',
        achievement: '1st Place in Healthcare Track (Out of 48 teams)',
        repo_url: 'https://github.com/alexrivera-demo/healthsync',
        event_date: '2026-03-12',
        skills: [INITIAL_SKILLS[0], INITIAL_SKILLS[2]],
        created_at: '2026-03-13T10:00:00Z',
        updated_at: '2026-03-13T10:00:00Z',
      },
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-20T00:00:00Z',
  },
  {
    id: 'stud-priya-2',
    email: 'priya.sharma@demo.talentgraph.io',
    role: 'student',
    full_name: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    institution: 'National Engineering College',
    degree: 'B.E.',
    field_of_study: 'Information Technology',
    current_year: 4,
    graduation_year: 2025,
    bio: 'Backend & systems engineer passionate about PostgreSQL query optimization, resilient pipelines, and Docker containers.',
    preferred_roles: ['Backend Engineer', 'Database Specialist', 'DevOps Intern'],
    preferred_locations: ['Hyderabad', 'Remote', 'Bangalore'],
    preferred_work_modes: ['remote', 'hybrid'],
    github_url: 'https://github.com/priyasharma-demo',
    portfolio_url: 'https://priyasharma.io',
    skills: [
      {
        profile_id: 'stud-priya-2',
        skill_id: 'skill-node',
        skill: INITIAL_SKILLS[2],
        proficiency_level: 'advanced',
        evidence_type: 'project_backed',
        evidence_count: 1,
      },
      {
        profile_id: 'stud-priya-2',
        skill_id: 'skill-postgres',
        skill: INITIAL_SKILLS[3],
        proficiency_level: 'advanced',
        evidence_type: 'project_backed',
        evidence_count: 1,
      },
      {
        profile_id: 'stud-priya-2',
        skill_id: 'skill-docker',
        skill: INITIAL_SKILLS[6],
        proficiency_level: 'intermediate',
        evidence_type: 'project_backed',
        evidence_count: 1,
      },
      {
        profile_id: 'stud-priya-2',
        skill_id: 'skill-python',
        skill: INITIAL_SKILLS[4],
        proficiency_level: 'intermediate',
        evidence_type: 'hackathon_backed',
        evidence_count: 1,
      },
    ],
    projects: [
      {
        id: 'proj-3',
        profile_id: 'stud-priya-2',
        title: 'Distributed Rate Limiter Service',
        description: 'High-throughput sliding-window rate limiter in Node.js with PostgreSQL persistence.',
        role: 'Backend Architect',
        contribution: 'Designed database connection pooling and optimized indexes reducing query latency by 42%.',
        outcomes: 'Benchmarked at 12,000 requests/sec with zero deadlocks.',
        repo_url: 'https://github.com/priyasharma-demo/rate-limiter',
        skills: [INITIAL_SKILLS[2], INITIAL_SKILLS[3], INITIAL_SKILLS[6]],
        created_at: '2026-02-10T10:00:00Z',
        updated_at: '2026-02-10T10:00:00Z',
      },
    ],
    hackathons: [
      {
        id: 'hack-2',
        profile_id: 'stud-priya-2',
        event_name: 'CloudHacks 2025',
        project_name: 'LogSentry Pipeline',
        role: 'Data Engineer',
        contribution: 'Constructed automated ingest worker in Python Docker container.',
        achievement: 'Finalist & Best Infrastructure Award',
        repo_url: 'https://github.com/priyasharma-demo/logsentry',
        event_date: '2025-10-18',
        skills: [INITIAL_SKILLS[4], INITIAL_SKILLS[6]],
        created_at: '2025-10-19T10:00:00Z',
        updated_at: '2025-10-19T10:00:00Z',
      },
    ],
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 'rec-marcus-1',
    email: 'marcus.vance@demo.talentgraph.io',
    role: 'recruiter',
    full_name: 'Marcus Vance',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    institution: 'NovaScale Technologies',
    bio: 'Lead Engineering Talent Partner at NovaScale Technologies.',
    preferred_roles: [],
    preferred_locations: [],
    preferred_work_modes: [],
    skills: [],
    projects: [],
    hackathons: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: 'int-novascale-frontend',
    recruiter_id: 'rec-marcus-1',
    title: 'Frontend Software Engineer Intern',
    organization: 'NovaScale Technologies',
    description: 'Join our core platform experience team. You will build high-performance web applications, contribute to our reusable design token system, and work closely with product designers and backend engineers.',
    responsibilities: [
      'Implement clean, accessible UI components in React and TypeScript',
      'Optimize web vitals, DOM rendering performance, and network responsiveness',
      'Collaborate on client-side state architecture and Vitest unit testing',
      'Participate in sprint demos and peer code reviews',
    ],
    location: 'Bangalore / Remote',
    work_mode: 'remote',
    duration: '6 Months (Summer / Fall)',
    stipend: '₹45,000 / month',
    deadline: '2026-12-15',
    application_url: 'https://novascale.example.com/careers/frontend-intern',
    contact_info: 'talent@novascale.example.com',
    status: 'active',
    eligible_degrees: ['B.Tech', 'B.E.', 'BS in Computer Science', 'BCA'],
    eligible_grad_years: [2026, 2027],
    eligible_min_year: 3,
    required_skills: [
      INITIAL_SKILLS[0], // React
      INITIAL_SKILLS[1], // TypeScript
      INITIAL_SKILLS[5], // Tailwind CSS
    ],
    preferred_skills: [
      INITIAL_SKILLS[9], // Next.js
      INITIAL_SKILLS[2], // Node.js
    ],
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'int-novascale-cloud',
    recruiter_id: 'rec-marcus-1',
    title: 'Full Stack Cloud Platform Intern',
    organization: 'NovaScale Technologies',
    description: 'Work at the intersection of microservice APIs and real-time dashboard observability. Build resilient cloud endpoints and ingest pipelines.',
    responsibilities: [
      'Design REST and GraphQL API services using Node.js and TypeScript',
      'Structure relational schemas and optimize queries in PostgreSQL',
      'Containerize development and test staging environments with Docker',
      'Build internal administrative tooling with React',
    ],
    location: 'Bangalore',
    work_mode: 'hybrid',
    duration: '6 Months',
    stipend: '₹50,000 / month',
    deadline: '2026-11-30',
    application_url: 'https://novascale.example.com/careers/cloud-intern',
    contact_info: 'careers@novascale.example.com',
    status: 'active',
    eligible_degrees: ['B.Tech', 'B.E.', 'MCA'],
    eligible_grad_years: [2025, 2026],
    eligible_min_year: 3,
    required_skills: [
      INITIAL_SKILLS[1], // TypeScript
      INITIAL_SKILLS[2], // Node.js
      INITIAL_SKILLS[3], // PostgreSQL
    ],
    preferred_skills: [
      INITIAL_SKILLS[6], // Docker
      INITIAL_SKILLS[7], // GraphQL
      INITIAL_SKILLS[0], // React
    ],
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'int-aethermind-ml',
    recruiter_id: 'rec-marcus-1',
    title: 'Data Science & Machine Learning Intern',
    organization: 'AetherMind AI Labs',
    description: 'Conduct empirical evaluations on tabular datasets, construct automated preprocessing pipelines, and validate model performance.',
    responsibilities: [
      'Write reproducible data transformation scripts in Python',
      'Run cross-validation tests and metric comparisons',
      'Package experimental scripts into clean reproducible Docker runners',
    ],
    location: 'Hyderabad',
    work_mode: 'onsite',
    duration: '3 Months',
    stipend: '₹40,000 / month',
    deadline: '2026-10-31',
    application_url: 'https://aethermind.example.com/careers/ml-intern',
    contact_info: 'recruiting@aethermind.example.com',
    status: 'active',
    eligible_degrees: ['B.Tech', 'M.Tech', 'MS in Data Science', 'B.E.'],
    eligible_grad_years: [2025, 2026],
    eligible_min_year: 3,
    required_skills: [
      INITIAL_SKILLS[4], // Python
      INITIAL_SKILLS[8], // Machine Learning
    ],
    preferred_skills: [
      INITIAL_SKILLS[6], // Docker
      INITIAL_SKILLS[3], // PostgreSQL
    ],
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'int-hyperlink-mobile',
    recruiter_id: 'rec-marcus-1',
    title: 'Cross-Platform Mobile Engineer Intern',
    organization: 'HyperLink Interactive',
    description: 'Help build fluid, responsive cross-platform mobile apps using Flutter and TypeScript backend services.',
    responsibilities: [
      'Develop cross-platform screens with native gestures and animations',
      'Integrate push notifications and local offline caching',
      'Publish internal test builds to Android and iOS testbeds',
    ],
    location: 'Remote',
    work_mode: 'remote',
    duration: '4 Months',
    stipend: '₹35,000 / month',
    deadline: '2026-12-01',
    application_url: 'https://hyperlink.example.com/jobs/mobile-intern',
    contact_info: 'jobs@hyperlink.example.com',
    status: 'active',
    eligible_degrees: ['B.Tech', 'B.E.', 'BCA', 'BS'],
    eligible_grad_years: [2026, 2027, 2028],
    eligible_min_year: 2,
    required_skills: [
      INITIAL_SKILLS[10], // Flutter
      INITIAL_SKILLS[1],  // TypeScript
    ],
    preferred_skills: [
      INITIAL_SKILLS[2],  // Node.js
      INITIAL_SKILLS[6],  // Docker
    ],
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
];

export const INITIAL_SAVED_INTERNSHIPS: SavedInternship[] = [
  {
    id: 'saved-1',
    student_id: 'stud-alex-1',
    internship_id: 'int-novascale-frontend',
    created_at: '2026-03-16T12:00:00Z',
  },
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    student_id: 'stud-alex-1',
    internship_id: 'int-novascale-frontend',
    status: 'applied',
    notes: 'Submitted portfolio featuring OpenTask and PulseUI.',
    applied_at: '2026-03-18T14:30:00Z',
    created_at: '2026-03-18T14:30:00Z',
    updated_at: '2026-03-18T14:30:00Z',
  },
];

export const INITIAL_SHORTLISTS: RecruiterShortlist[] = [
  {
    id: 'short-1',
    recruiter_id: 'rec-marcus-1',
    internship_id: 'int-novascale-frontend',
    student_id: 'stud-alex-1',
    notes: 'Excellent project portfolio with demonstrated React & TypeScript evidence.',
    status: 'shortlisted',
    created_at: '2026-03-20T09:00:00Z',
  },
];
