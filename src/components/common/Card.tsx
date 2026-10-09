import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padded = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(60,64,67,0.06),0_1px_2px_0_rgba(60,64,67,0.04)] ${
        padded ? 'p-5 sm:p-6' : ''
      } ${
        hoverable
          ? 'hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(60,64,67,0.1)] transition-all duration-200'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
