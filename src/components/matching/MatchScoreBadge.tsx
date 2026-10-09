import React from 'react';
import { RecommendationTier } from '../../types/matching';
import { Sparkles } from 'lucide-react';

export interface MatchScoreBadgeProps {
  score: number;
  tier: RecommendationTier;
  size?: 'sm' | 'md' | 'lg';
  showTier?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  tier,
  size = 'md',
  showTier = true,
}) => {
  // Color tokens by tier
  const tierColor = {
    'Strong Match': 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]',
    'Good Match': 'bg-[#E8F0FE] text-[#1967D2] border-[#D2E3FC]',
    'Potential Match': 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]',
    'Limited Match': 'bg-slate-100 text-slate-700 border-slate-200',
    'Not Eligible': 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]',
  }[tier];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-bold',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-semibold rounded-lg border transition-all ${tierColor} ${sizeClasses}`}
    >
      <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span>{score}% Fit</span>
      {showTier && (
        <>
          <span className="opacity-40">•</span>
          <span className="font-medium text-xs tracking-tight">{tier}</span>
        </>
      )}
    </div>
  );
};
