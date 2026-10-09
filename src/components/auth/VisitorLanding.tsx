import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { AuthModal } from './AuthModal';
import {
  ShieldCheck,
  GraduationCap,
  Building,
  Target,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const VisitorLanding: React.FC = () => {
  const { enterDemoMode } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="py-8 sm:py-16 space-y-12 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0FE] text-[#1967D2] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#4285F4]" />
          <span>Explainable Internship Matching Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Where student evidence meets transparent internship hiring.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          No black-box algorithms or AI hallucinations. TalentGraph uses deterministic,
          evidence-backed scoring to connect verified student projects with recruiter opportunities.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => openAuth('signup')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Create Your Account
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => openAuth('login')}
          >
            Sign In with Supabase
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => enterDemoMode('student')}
            className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer"
            icon={<Database className="w-4 h-4 text-amber-700" />}
          >
            Explore Student Demo
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => enterDemoMode('recruiter')}
            className="text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 cursor-pointer"
            icon={<Building className="w-4 h-4 text-slate-600" />}
          >
            Explore Recruiter Demo
          </Button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        <Card className="p-6 border-slate-200 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">For Student Candidates</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Link real GitHub repositories, hackathon awards, and deployed applications. See exactly why you match or what skills to develop to qualify for top opportunities.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => enterDemoMode('student')}
              className="text-xs font-bold text-[#1967D2] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Try Student Experience →
            </button>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center mb-3">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">For Tech Recruiters</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Filter through ranked candidates based on concrete deliverables rather than buzzwords. Inspect verifiable project contributions and save candidate shortlists.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => enterDemoMode('recruiter')}
              className="text-xs font-bold text-[#137333] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Try Recruiter Portal →
            </button>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF7E0] text-[#B06000] flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Deterministic Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Transparent scoring breakdowns across required skills (50%), preferred skills (20%), and verified project evidence (30%) with hard eligibility gating.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34A853]" /> 100% Explainable
            </span>
          </div>
        </Card>
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authMode}
        />
      )}
    </div>
  );
};
