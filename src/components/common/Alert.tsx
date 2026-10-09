import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = {
    info: {
      container: 'bg-[#E8F0FE] border-[#D2E3FC] text-[#174EA6]',
      icon: <Info className="w-5 h-5 text-[#1967D2] shrink-0" />,
    },
    success: {
      container: 'bg-[#E6F4EA] border-[#CEEAD6] text-[#137333]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#188038] shrink-0" />,
    },
    warning: {
      container: 'bg-[#FEF7E0] border-[#FEEFC3] text-[#B06000]',
      icon: <AlertTriangle className="w-5 h-5 text-[#E37400] shrink-0" />,
    },
    error: {
      container: 'bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]',
      icon: <AlertCircle className="w-5 h-5 text-[#D93025] shrink-0" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles.container} ${className}`}
    >
      {styles.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
