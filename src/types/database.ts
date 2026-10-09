export type UserRole = 'student' | 'recruiter';

export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type EvidenceType = 'self_declared' | 'project_backed' | 'hackathon_backed';

export type ApplicationStatus =
  | 'interested'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'
  | 'closed';

export type InternshipStatus = 'active' | 'closed' | 'draft';

export interface Skill {
  id: string;
  name: string;
  category?: string;
  normalized_name: string;
}

export interface ProfileSkill {
  id?: string;
  profile_id: string;
  skill_id: string;
  skill: Skill;
  proficiency_level: ProficiencyLevel;
  evidence_type: EvidenceType;
  evidence_count?: number;
}

export interface Project {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  repo_url?: string;
  live_url?: string;
  role: string;
  contribution: string;
  outcomes?: string;
  skills: Skill[];
  created_at: string;
  updated_at: string;
}

export interface HackathonExperience {
  id: string;
  profile_id: string;
  event_name: string;
  project_name: string;
  role: string;
  contribution: string;
  achievement?: string;
  repo_url?: string;
  event_date?: string;
  skills: Skill[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  current_year?: number;
  graduation_year?: number;
  bio?: string;
  preferred_roles: string[];
  preferred_locations: string[];
  preferred_work_modes: WorkMode[];
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  skills: ProfileSkill[];
  projects: Project[];
  hackathons: HackathonExperience[];
  created_at: string;
  updated_at: string;
}

export interface Internship {
  id: string;
  recruiter_id: string;
  title: string;
  organization: string;
  description: string;
  responsibilities: string[];
  location: string;
  work_mode: WorkMode;
  duration: string;
  stipend?: string;
  deadline?: string;
  application_url: string;
  contact_info?: string;
  status: InternshipStatus;
  eligible_degrees: string[];
  eligible_grad_years: number[];
  eligible_min_year?: number;
  required_skills: Skill[];
  preferred_skills: Skill[];
  created_at: string;
  updated_at: string;
}

export interface SavedInternship {
  id: string;
  student_id: string;
  internship_id: string;
  created_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  internship_id: string;
  internship?: Internship;
  status: ApplicationStatus;
  notes?: string;
  applied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RecruiterShortlist {
  id: string;
  recruiter_id: string;
  internship_id: string;
  student_id: string;
  student?: Profile;
  notes?: string;
  status: 'shortlisted' | 'contacted' | 'rejected';
  created_at: string;
}
