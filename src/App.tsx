import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TalentGraphProvider } from './context/TalentGraphContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { DemoBanner } from './components/layout/DemoBanner';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { VisitorLanding } from './components/auth/VisitorLanding';

import { StudentDashboard } from './components/student/StudentDashboard';
import { FindInternships } from './components/student/FindInternships';
import { MyProfile } from './components/student/MyProfile';
import { ApplicationTracker } from './components/student/ApplicationTracker';
import { GrowthGuidance } from './components/growth/GrowthGuidance';

import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { CandidateDiscovery } from './components/recruiter/CandidateDiscovery';
import { ShortlistManager } from './components/recruiter/ShortlistManager';
import { CreateInternshipModal } from './components/recruiter/CreateInternshipModal';

const STUDENT_VIEWS = ['dashboard', 'find-internships', 'my-profile', 'applications', 'growth'];
const RECRUITER_VIEWS = ['recruiter-dashboard', 'candidate-discovery', 'shortlists'];

const AppContent: React.FC = () => {
  const { currentRole, needsOnboarding, loading } = useAuth();

  const getInitialView = (role: string) => {
    if (typeof window === 'undefined') return role === 'student' ? 'dashboard' : role === 'recruiter' ? 'recruiter-dashboard' : 'landing';
    const hash = window.location.hash.replace(/^#/, '');
    if (role === 'student') {
      return STUDENT_VIEWS.includes(hash) ? hash : 'dashboard';
    }
    if (role === 'recruiter') {
      return RECRUITER_VIEWS.includes(hash) ? hash : 'recruiter-dashboard';
    }
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<string>(() => getInitialView(currentRole));
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Sync default view whenever role changes
  useEffect(() => {
    if (currentRole === 'student') {
      const hash = window.location.hash.replace(/^#/, '');
      const target = STUDENT_VIEWS.includes(hash) ? hash : 'dashboard';
      setCurrentView(target);
      if (window.location.hash !== `#${target}`) {
        window.history.replaceState(null, '', `#${target}`);
      }
    } else if (currentRole === 'recruiter') {
      const hash = window.location.hash.replace(/^#/, '');
      const target = RECRUITER_VIEWS.includes(hash) ? hash : 'recruiter-dashboard';
      setCurrentView(target);
      if (window.location.hash !== `#${target}`) {
        window.history.replaceState(null, '', `#${target}`);
      }
    } else {
      setCurrentView('landing');
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [currentRole]);

  // Support browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (currentRole === 'student' && STUDENT_VIEWS.includes(hash)) {
        setCurrentView(hash);
      } else if (currentRole === 'recruiter' && RECRUITER_VIEWS.includes(hash)) {
        setCurrentView(hash);
      }
    };

    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentRole]);

  // Handle route navigation with role authorization guard
  const handleNavigate = (view: string) => {
    if (view === 'create-internship') {
      if (currentRole === 'recruiter') {
        setIsPostModalOpen(true);
      }
      return;
    }

    // Role boundary checks: do not permit student to open recruiter views or vice versa
    if (currentRole === 'student' && RECRUITER_VIEWS.includes(view)) {
      return;
    }
    if (currentRole === 'recruiter' && STUDENT_VIEWS.includes(view)) {
      return;
    }

    setCurrentView(view);
    if (window.location.hash !== `#${view}`) {
      window.history.pushState(null, '', `#${view}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 rounded-full bg-[#FBBC05] animate-bounce"></span>
            <span className="w-3 h-3 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.15s]"></span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Loading TalentGraph...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#202124]">
      {/* Top Demo/Status Banner */}
      <DemoBanner />

      {/* Main Navbar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Primary Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {currentRole === 'visitor' ? (
          <VisitorLanding />
        ) : currentRole === 'student' ? (
          <>
            {currentView === 'dashboard' && <StudentDashboard onNavigate={handleNavigate} />}
            {currentView === 'find-internships' && <FindInternships />}
            {currentView === 'my-profile' && <MyProfile />}
            {currentView === 'applications' && <ApplicationTracker />}
            {currentView === 'growth' && <GrowthGuidance />}
          </>
        ) : (
          <>
            {currentView === 'recruiter-dashboard' && (
              <RecruiterDashboard onNavigate={handleNavigate} />
            )}
            {currentView === 'candidate-discovery' && <CandidateDiscovery />}
            {currentView === 'shortlists' && <ShortlistManager />}
          </>
        )}
      </main>

      {/* Onboarding Modal for New Authenticated Users */}
      {needsOnboarding && <OnboardingModal />}

      {/* Recruiter Quick Post Modal */}
      {isPostModalOpen && (
        <CreateInternshipModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {currentRole !== 'visitor' && (
        <BottomNav currentView={currentView} onNavigate={handleNavigate} />
      )}

      {/* Google-Inspired Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
              <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
              <span className="w-2 h-2 rounded-full bg-[#FBBC05]"></span>
              <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
            </div>
            <span className="font-bold text-slate-700">TalentGraph</span>
            <span>• Explainable Internship Matching System</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Deterministic Scoring</span>
            <span>Evidence-Based Verification</span>
            <span>Supabase Auth &amp; RLS</span>
            <span>Zero Paid AI Dependencies</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TalentGraphProvider>
        <AppContent />
      </TalentGraphProvider>
    </AuthProvider>
  );
}
