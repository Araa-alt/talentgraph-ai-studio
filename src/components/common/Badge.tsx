import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  }[size];

  const variantClasses = {
    blue: 'bg-[#E8F0FE] text-[#1967D2] border border-[#D2E3FC]',
    green: 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',
    yellow: 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]',
    red: 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
