import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { EligibilityStatus } from '../../types/matching';
import { Badge } from '../common/Badge';

export interface EligibilityBadgeProps {
  status: EligibilityStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  if (status === 'eligible') {
    return (
      <Badge
        variant="green"
        size={size}
        icon={<CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      >
        {showLabel ? 'Eligible' : ''}
      </Badge>
    );
  }

  if (status === 'ineligible') {
    return (
      <Badge
        variant="red"
        size={size}
        icon={<XCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      >
        {showLabel ? 'Ineligible' : ''}
      </Badge>
    );
  }

  return (
    <Badge
      variant="yellow"
      size={size}
      icon={<HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
    >
      {showLabel ? 'Needs Confirmation' : ''}
    </Badge>
  );
};
