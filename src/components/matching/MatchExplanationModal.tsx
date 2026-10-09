import React from 'react';
import { Modal } from '../common/Modal';
import { MatchExplanation } from '../../types/matching';
import { Internship, Profile } from '../../types/database';
import { EligibilityBadge } from './EligibilityBadge';
import { MatchScoreBadge } from './MatchScoreBadge';
import { Check, X, HelpCircle, Briefcase, Award, ExternalLink, Layers, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface MatchExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: Internship;
  candidate?: Profile;
  match: MatchExplanation;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  isOpen,
  onClose,
  internship,
  match,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transparent Match Breakdown"
      description={`Evidence-based evaluation for ${internship.title} at ${internship.organization}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <MatchScoreBadge score={match.overallScore} tier={match.recommendationTier} size="lg" />
            <EligibilityBadge status={match.eligibilityStatus} size="md" />
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Deterministic Engine v1.0
          </span>
        </div>

        {/* Plain Language Explanation */}
        <div className="p-4 rounded-xl bg-[#E8F0FE]/60 border border-[#D2E3FC]">
          <h4 className="text-xs font-bold text-[#1967D2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Plain-Language Assessment
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed">
            {match.plainTextExplanation}
          </p>
        </div>

        {/* Hard Eligibility Checklist */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hard Eligibility Criteria
            </h4>
            <span className="text-[11px] text-slate-500">
              {match.eligibilityChecks.filter((c) => c.status === 'eligible').length} / {match.eligibilityChecks.length} satisfied
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {match.eligibilityChecks.map((chk, i) => (
              <div key={i} className="px-4 py-3 flex items-start justify-between gap-3 text-sm">
                <div className="flex items-start gap-2.5">
                  {chk.status === 'eligible' && (
                    <span className="mt-0.5 p-1 rounded-full bg-[#E6F4EA] text-[#188038]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                  {chk.status === 'ineligible' && (
                    <span className="mt-0.5 p-1 rounded-full bg-[#FCE8E6] text-[#D93025]">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                  {chk.status === 'unknown' && (
                    <span className="mt-0.5 p-1 rounded-full bg-[#FEF7E0] text-[#B06000]">
                      <HelpCircle className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                  <div>
                    <span className="font-semibold text-slate-900">{chk.name}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{chk.reason}</p>
                  </div>
                </div>
                <EligibilityBadge status={chk.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Required Skills Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#188038]" /> Matched Required Skills
              </h4>
              <span className="text-xs font-semibold text-[#188038]">
                {match.skillMatch.matchedRequired.length} / {internship.required_skills.length}
              </span>
            </div>
            {match.skillMatch.matchedRequired.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {match.skillMatch.matchedRequired.map((s) => (
                  <Badge key={s.id} variant="green" size="sm">
                    {s.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No required skills matched</p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B06000]" /> Missing Skills
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {match.skillMatch.missingRequired.length} required
              </span>
            </div>
            {match.skillMatch.missingRequired.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {match.skillMatch.missingRequired.map((s) => (
                  <Badge key={s.id} variant="yellow" size="sm">
                    {s.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#188038] font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> All required skills covered!
              </p>
            )}
          </div>
        </div>

        {/* Demonstrated Evidence Breakdown */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1A73E8]" /> Demonstrated Evidence in Portfolio
            </h4>
            <span className="text-xs font-semibold text-[#1A73E8]">
              {match.evidenceBreakdown.skillsWithEvidenceCount} verified skills
            </span>
          </div>

          {match.evidenceBreakdown.relevantProjects.length === 0 &&
          match.evidenceBreakdown.relevantHackathons.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 bg-slate-50 rounded-lg">
              No matching skills currently tied to verified projects or hackathons.
            </div>
          ) : (
            <div className="space-y-3">
              {match.evidenceBreakdown.relevantProjects.map(({ project, demonstratedSkills }) => (
                <div key={project.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      {project.title}
                    </span>
                    {project.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#1A73E8] hover:underline inline-flex items-center gap-0.5"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{project.contribution}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {demonstratedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                      >
                        Proven: {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {match.evidenceBreakdown.relevantHackathons.map(({ hackathon, demonstratedSkills }) => (
                <div key={hackathon.id} className="p-3 rounded-lg bg-[#FEF7E0]/40 border border-[#FEEFC3]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#E37400]" />
                      {hackathon.event_name} ({hackathon.project_name})
                    </span>
                    {hackathon.achievement && (
                      <span className="text-[11px] font-medium text-[#B06000]">
                        🏆 {hackathon.achievement}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {demonstratedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                      >
                        Proven: {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scoring Weights Disclaimer */}
        <div className="text-[11px] text-slate-400 text-center leading-normal">
          Fit score calculated using provisional weights: Skills (60%), Evidence (20%), Role interest (10%), Preferences (10%).
          <br />
          Fit score reflects profile alignment, not guaranteed hiring probability.
        </div>
      </div>
    </Modal>
  );
};
