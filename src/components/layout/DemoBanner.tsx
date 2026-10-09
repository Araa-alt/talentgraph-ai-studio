import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Database, X, ShieldCheck, LogOut } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, authUser, currentRole, exitDemoMode } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (isDemoMode) {
    return (
      <aside
        aria-label="Demo mode notice"
        className="bg-[#FEF7E0] border-b border-[#FEEFC3] px-4 py-2 text-xs text-[#7A4B00] transition-all"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#B06000] shrink-0" />
            <span>
              <strong>Demo Mode:</strong> Running with local seed database and sample personas. All data resets when exiting demo.
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={exitDemoMode}
              className="px-2.5 py-1 rounded bg-amber-200/90 hover:bg-amber-300 text-amber-900 font-bold text-xs transition-colors flex items-center gap-1.5 border border-amber-300 shadow-sm cursor-pointer"
              title="Return to visitor landing page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Demo Mode</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="p-1 hover:bg-[#FEEFC3] rounded text-[#7A4B00] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (authUser) {
    return (
      <aside
        aria-label="Supabase live mode notice"
        className="bg-[#E6F4EA] border-b border-[#CEEAD6] px-4 py-1.5 text-xs text-[#137333] transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#188038] shrink-0" />
            <span>
              <strong>Supabase Connected:</strong> Authenticated as <span className="font-semibold">{authUser.email}</span> ({currentRole}). Your profiles, applications, and listings are persisted with Row-Level Security.
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 hover:bg-[#CEEAD6] rounded text-[#137333] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  return null;
};
