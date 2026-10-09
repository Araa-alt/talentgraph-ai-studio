import React, { useState } from 'react';
import { Profile, Internship } from '../../types/database';
import { MatchExplanation } from '../../types/matching';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';
import { EligibilityBadge } from '../matching/EligibilityBadge';
import { MatchExplanationModal } from '../matching/MatchExplanationModal';
import { useTalentGraph } from '../../context/TalentGraphContext';
import {
  GraduationCap,
  Briefcase,
  Award,
  ExternalLink,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface CandidateRankingCardProps {
  candidate: Profile;
  internship: Internship;
  match: MatchExplanation;
}

export const CandidateRankingCard: React.FC<CandidateRankingCardProps> = ({
  candidate,
  internship,
  match,
}) => {
  const { shortlists, toggleShortlistCandidate } = useTalentGraph();
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState(false);

  const isShortlisted = shortlists.some(
    (s) => s.internship_id === internship.id && s.student_id === candidate.id
  );

  return (
    <>
      <Card className="border-slate-200/90 hover:border-slate-300 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Candidate Info Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              {candidate.full_name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{candidate.full_name}</h3>
                <EligibilityBadge status={match.eligibilityStatus} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.degree || 'Degree'} • Class of {candidate.graduation_year || 'TBD'}
                </span>
                <span>{candidate.institution}</span>
              </div>

              {candidate.bio && (
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 max-w-xl">
                  {candidate.bio}
                </p>
              )}
            </div>
          </div>

          {/* Match Score & Actions */}
          <div className="flex items-center gap-3 self-end lg:self-center">
            <MatchScoreBadge score={match.overallScore} tier={match.recommendationTier} size="md" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplainModal(true)}
              className="text-xs text-[#1A73E8]"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Breakdown
            </Button>

            <Button
              variant={isShortlisted ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => toggleShortlistCandidate(internship.id, candidate.id)}
              icon={<Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />}
            >
              {isShortlisted ? 'Shortlisted' : 'Shortlist'}
            </Button>
          </div>
        </div>

        {/* Skills Matched & Missing Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider block mb-1">
              Required Skills Matched ({match.skillMatch.matchedRequired.length} / {internship.required_skills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {match.skillMatch.matchedRequired.map((s) => (
                <Badge key={s.id} variant="green" size="sm">
                  ✓ {s.name}
                </Badge>
              ))}
              {match.skillMatch.missingRequired.map((s) => (
                <Badge key={s.id} variant="neutral" size="sm" className="opacity-60">
                  missing: {s.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider block mb-1">
              Verified Evidence Summary
            </span>
            <div className="flex items-center justify-between text-slate-600">
              <span>
                {match.evidenceBreakdown.relevantProjects.length} relevant project(s) •{' '}
                {match.evidenceBreakdown.relevantHackathons.length} hackathon(s)
              </span>
              <button
                onClick={() => setExpandedEvidence(!expandedEvidence)}
                className="text-xs text-[#1A73E8] hover:underline flex items-center gap-0.5 font-medium"
              >
                {expandedEvidence ? 'Hide' : 'Inspect'} Evidence{' '}
                {expandedEvidence ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Evidence Drawer */}
        {expandedEvidence && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
            {candidate.projects?.map((proj) => (
              <div key={proj.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    {proj.title} ({proj.role})
                  </span>
                  {proj.repo_url && (
                    <a
                      href={proj.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1A73E8] hover:underline flex items-center gap-0.5"
                    >
                      Code <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-slate-600 mt-1">{proj.contribution}</p>
              </div>
            ))}

            {candidate.hackathons?.map((hack) => (
              <div key={hack.id} className="p-2.5 rounded-lg bg-[#FEF7E0]/40 border border-[#FEEFC3] text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#B06000]" />
                    {hack.event_name} — {hack.project_name}
                  </span>
                  {hack.achievement && (
                    <span className="text-[#B06000] font-medium text-[11px]">
                      🏆 {hack.achievement}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 mt-1">{hack.contribution}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <MatchExplanationModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        internship={internship}
        candidate={candidate}
        match={match}
      />
    </>
  );
};
