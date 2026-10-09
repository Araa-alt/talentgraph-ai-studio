import { Skill, Project, HackathonExperience } from './database';

export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';

export interface EligibilityCheck {
  criterion: 'degree' | 'graduation_year' | 'minimum_year' | 'work_mode_compatibility';
  name: string;
  status: EligibilityStatus;
  reason: string;
  requiredValue: string | number | string[];
  studentValue: string | number | string[] | null | undefined;
}

export interface SkillMatchResult {
  matchedRequired: Skill[];
  matchedPreferred: Skill[];
  missingRequired: Skill[];
  missingPreferred: Skill[];
  requiredMatchRatio: number;
  preferredMatchRatio: number;
  overallSkillScore: number;
}

export interface EvidenceProjectMatch {
  project: Project;
  demonstratedSkills: string[];
}

export interface EvidenceHackathonMatch {
  hackathon: HackathonExperience;
  demonstratedSkills: string[];
}

export interface EvidenceBreakdown {
  relevantProjects: EvidenceProjectMatch[];
  relevantHackathons: EvidenceHackathonMatch[];
  skillsWithEvidenceCount: number;
  evidenceScore: number; // 0 - 100
}

export type RecommendationTier =
  | 'Strong Match'
  | 'Good Match'
  | 'Potential Match'
  | 'Limited Match'
  | 'Not Eligible';

export interface MatchWeights {
  requiredSkills: number;  // Default 0.45
  preferredSkills: number; // Default 0.15
  evidence: number;        // Default 0.20
  roleInterest: number;    // Default 0.10
  preferences: number;     // Default 0.10
}

export interface MatchExplanation {
  overallScore: number; // 0 - 100
  eligibilityStatus: EligibilityStatus;
  eligibilityChecks: EligibilityCheck[];
  skillMatch: SkillMatchResult;
  evidenceBreakdown: EvidenceBreakdown;
  roleInterestScore: number;
  preferenceScore: number;
  plainTextExplanation: string;
  strengths: string[];
  skillGaps: string[];
  recommendationTier: RecommendationTier;
  calculationWeights: MatchWeights;
}
