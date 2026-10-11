import React, { useState } from 'react';
import { Internship } from '../../types/database';
import { MatchExplanation } from '../../types/matching';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';
import { EligibilityBadge } from '../matching/EligibilityBadge';
import { MatchExplanationModal } from '../matching/MatchExplanationModal';
import { useTalentGraph } from '../../context/TalentGraphContext';
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Send,
} from 'lucide-react';

export interface InternshipCardProps {
  internship: Internship;
  match?: MatchExplanation;
  onSelect: (internship: Internship) => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  match,
  onSelect,
}) => {
  const { savedInternshipIds, toggleSaveInternship, applications, updateApplicationStatus } =
    useTalentGraph();
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const isSaved = savedInternshipIds.includes(internship.id);

  const existingApp = applications.find((a) => a.internship_id === internship.id);
  const hasApplied = existingApp?.status === 'applied';

  const handleDirectApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasApplied || isApplying) return;
    setIsApplying(true);
    try {
      await updateApplicationStatus(
        internship.id,
        'applied',
        'Direct application submitted via TalentGraph student portal'
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      <Card hoverable className="flex flex-col justify-between h-full border-slate-200/80">
        <div>
          {/* Header row: Organization & Bookmark */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {internship.organization}
              </span>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#4285F4] transition-colors mt-0.5">
                {internship.title}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveInternship(internship.id);
              }}
              aria-label={isSaved ? 'Remove from saved' : 'Save internship'}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#D2E3FC]'
                  : 'text-slate-400 hover:text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Meta Attributes */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {internship.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {internship.duration}
            </span>
            {internship.stipend && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <DollarSign className="w-3.5 h-3.5 text-[#188038]" />
                {internship.stipend}
              </span>
            )}
            <Badge
              variant={internship.work_mode === 'remote' ? 'green' : 'neutral'}
              size="sm"
            >
              {internship.work_mode.toUpperCase()}
            </Badge>
          </div>

          {/* Match Score & Hard Eligibility Badges */}
          {match && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
              <MatchScoreBadge score={match.overallScore} tier={match.recommendationTier} size="sm" />
              <EligibilityBadge status={match.eligibilityStatus} size="sm" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMatchModal(true);
                }}
                className="text-xs text-[#1A73E8] hover:underline font-semibold ml-auto flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3 text-[#4285F4]" /> Why I Match
              </button>
            </div>
          )}

          {/* Skills Required */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Required Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {internship.required_skills.slice(0, 4).map((s) => {
                const isMatched = match?.skillMatch.matchedRequired.some(
                  (ms) => ms.id === s.id || ms.normalized_name === s.normalized_name
                );
                return (
                  <Badge
                    key={s.id}
                    variant={isMatched ? 'green' : 'neutral'}
                    size="sm"
                  >
                    {isMatched ? `✓ ${s.name}` : s.name}
                  </Badge>
                );
              })}
              {internship.required_skills.length > 4 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{internship.required_skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelect(internship)}
            className="flex-1 text-xs"
          >
            Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
          <Button
            size="sm"
            variant={hasApplied ? 'secondary' : 'primary'}
            onClick={handleDirectApply}
            disabled={isApplying || hasApplied}
            className="text-xs shrink-0"
            icon={hasApplied ? <CheckCircle className="w-3.5 h-3.5 text-[#188038]" /> : <Send className="w-3.5 h-3.5" />}
          >
            {hasApplied ? 'Applied ✓' : 'Apply'}
          </Button>
        </div>
      </Card>

      {match && (
        <MatchExplanationModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          internship={internship}
          match={match}
        />
      )}
    </>
  );
};
