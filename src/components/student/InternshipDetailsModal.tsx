import React, { useState } from 'react';
import { Internship, ApplicationStatus } from '../../types/database';
import { MatchExplanation } from '../../types/matching';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';
import { EligibilityBadge } from '../matching/EligibilityBadge';
import { useTalentGraph } from '../../context/TalentGraphContext';
import {
  ExternalLink,
  Bookmark,
} from 'lucide-react';

export interface InternshipDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: Internship | null;
  match?: MatchExplanation;
}

export const InternshipDetailsModal: React.FC<InternshipDetailsModalProps> = ({
  isOpen,
  onClose,
  internship,
  match,
}) => {
  const { savedInternshipIds, toggleSaveInternship, applications, updateApplicationStatus } =
    useTalentGraph();

  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!internship) return null;

  const isSaved = savedInternshipIds.includes(internship.id);
  const existingApp = applications.find((a) => a.internship_id === internship.id);

  const handleStatusChange = async (status: ApplicationStatus) => {
    setIsUpdating(true);
    try {
      await updateApplicationStatus(internship.id, status, notes || existingApp?.notes);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={internship.title}
      description={`${internship.organization} • ${internship.location}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Match and Eligibility summary banner */}
        {match && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <MatchScoreBadge score={match.overallScore} tier={match.recommendationTier} size="md" />
              <EligibilityBadge status={match.eligibilityStatus} size="md" />
            </div>
            <p className="text-xs text-slate-600 line-clamp-1 max-w-sm">
              {match.plainTextExplanation}
            </p>
          </div>
        )}

        {/* Quick Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Work Mode
            </span>
            <span className="text-xs font-semibold text-slate-800 capitalize mt-0.5 block">
              {internship.work_mode}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Duration
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {internship.duration}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Stipend
            </span>
            <span className="text-xs font-semibold text-[#188038] mt-0.5 block">
              {internship.stipend || 'Competitive'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Deadline
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'Rolling'}
            </span>
          </div>
        </div>

        {/* Role Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            About the Internship
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {internship.description}
          </p>
        </div>

        {/* Responsibilities */}
        {internship.responsibilities && internship.responsibilities.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Key Responsibilities
            </h4>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {internship.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#4285F4] mt-1">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explicit Eligibility Constraints */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Mandatory Eligibility Criteria
          </h4>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div>
              <strong>Accepted Programs:</strong>{' '}
              {internship.eligible_degrees.length > 0
                ? internship.eligible_degrees.join(', ')
                : 'All relevant degree programs'}
            </div>
            <div>
              <strong>Eligible Graduation Years:</strong>{' '}
              {internship.eligible_grad_years.length > 0
                ? internship.eligible_grad_years.join(', ')
                : 'Open to all years'}
            </div>
            <div>
              <strong>Minimum Academic Year:</strong> Year {internship.eligible_min_year || 1}+
            </div>
          </div>
        </div>

        {/* Skills Required & Preferred */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Required Technical Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {internship.required_skills.map((s) => (
                <Badge key={s.id} variant="blue" size="sm">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>

          {internship.preferred_skills && internship.preferred_skills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Preferred Qualifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {internship.preferred_skills.map((s) => (
                  <Badge key={s.id} variant="neutral" size="sm">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Application Tracker Section */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              My Application Tracker
            </h4>
            {existingApp && (
              <Badge variant="blue" size="sm">
                Status: {existingApp.status.toUpperCase()}
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Record your application stage. TalentGraph does not submit forms on employer websites automatically.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {(['interested', 'applied', 'interview', 'offer', 'rejected', 'withdrawn'] as ApplicationStatus[]).map(
              (st) => {
                const isCurrent = existingApp?.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    disabled={isUpdating}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      isCurrent
                        ? 'bg-[#4285F4] text-white border-[#4285F4] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                );
              }
            )}
          </div>

          <div className="pt-2">
            <input
              type="text"
              placeholder="Private note (e.g. Applied with portfolio link, Interview on Friday)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => toggleSaveInternship(internship.id)}
            icon={<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-[#1A73E8]' : ''}`} />}
          >
            {isSaved ? 'Saved to Bookmarks' : 'Save Opportunity'}
          </Button>

          <a
            href={internship.application_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 rounded-lg bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-sm gap-2 transition-colors ml-auto"
          >
            Apply on Employer Portal <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Modal>
  );
};
