import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  User,
  Search,
  Sparkles,
  BookmarkCheck,
  Building,
  Menu,
  X,
  PlusCircle,
  Users,
  ChevronDown,
  LogIn,
  LogOut,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { AuthModal } from '../auth/AuthModal';

export interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const {
    authUser,
    currentProfile,
    currentRole,
    isDemoMode,
    switchRole,
    switchProfile,
    availableProfiles,
    signOut,
    enterDemoMode,
    exitDemoMode,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'find-internships', label: 'Find Internships', icon: <Search className="w-4 h-4" /> },
    { id: 'my-profile', label: 'My Profile & Evidence', icon: <User className="w-4 h-4" /> },
    { id: 'applications', label: 'Saved & Applications', icon: <BookmarkCheck className="w-4 h-4" /> },
    { id: 'growth', label: 'Growth Guidance', icon: <Briefcase className="w-4 h-4" /> },
  ];

  const recruiterNavItems = [
    { id: 'recruiter-dashboard', label: 'Recruiter Dashboard', icon: <Building className="w-4 h-4" /> },
    { id: 'create-internship', label: 'Post Internship', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'candidate-discovery', label: 'Ranked Candidates', icon: <Users className="w-4 h-4" /> },
    { id: 'shortlists', label: 'Shortlists', icon: <BookmarkCheck className="w-4 h-4" /> },
  ];

  const navItems = currentRole === 'student' ? studentNavItems : recruiterNavItems;

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setPersonaDropdownOpen(false);
  };

  const handleLogoClick = () => {
    if (currentRole === 'visitor') {
      onNavigate('landing');
    } else if (currentRole === 'student') {
      onNavigate('dashboard');
    } else {
      onNavigate('recruiter-dashboard');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Google Dots */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 group text-left cursor-pointer"
              >
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]"></span>
                </div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Talent<span className="text-[#4285F4]">Graph</span>
                </span>
              </button>

              {/* Status Badge */}
              {isDemoMode ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3] text-[10px] font-bold uppercase tracking-wider">
                  <Database className="w-3 h-3" /> Demo Mode
                </span>
              ) : authUser ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Supabase Live
                </span>
              ) : null}
            </div>

            {/* Desktop Navigation Links */}
            {currentRole !== 'visitor' && (
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#E8F0FE] text-[#1967D2]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Right Action: Auth, Demo Controls or Persona Switcher */}
            <div className="flex items-center gap-2">
              {authUser ? (
                /* Authenticated User Menu */
                <div className="relative">
                  <button
                    onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1967D2] text-white flex items-center justify-center font-bold text-[11px]">
                      {currentProfile?.full_name?.charAt(0) || authUser.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="font-semibold text-xs leading-none text-slate-900 max-w-[120px] truncate">
                        {currentProfile?.full_name || authUser.email}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize leading-none mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
                        {currentRole}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {personaDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900">
                          {currentProfile?.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{authUser.email}</div>
                        <div className="mt-1">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#1967D2] uppercase">
                            {currentRole}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        {currentRole === 'student' && (
                          <button
                            onClick={() => {
                              onNavigate('my-profile');
                              setPersonaDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-slate-400" /> My Profile &amp; Evidence
                          </button>
                        )}

                        <button
                          onClick={() => {
                            enterDemoMode();
                            setPersonaDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#FBBC05]" /> Switch to Demo Mode
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            signOut();
                            setPersonaDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" /> Sign Out to Visitor Page
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : isDemoMode ? (
                /* Demo Mode Menu & Visible Exit Controls */
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exitDemoMode}
                    className="text-xs text-amber-800 border-amber-300 bg-white hover:bg-amber-50 cursor-pointer"
                    icon={<LogOut className="w-3.5 h-3.5 text-amber-700" />}
                    title="Return to visitor landing page"
                  >
                    <span className="hidden sm:inline">Exit Demo</span>
                    <span className="sm:hidden">Exit</span>
                  </Button>

                  <div className="relative">
                    <button
                      onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-200 bg-[#FEF7E0]/60 hover:bg-[#FEF7E0] text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                      title="Switch demo persona"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#B06000] text-white flex items-center justify-center font-bold text-[11px]">
                        {currentProfile?.full_name?.charAt(0) || 'D'}
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="font-semibold text-xs leading-none text-slate-900">
                          {currentProfile?.full_name || 'Demo Persona'}
                        </div>
                        <div className="text-[10px] text-amber-700 capitalize leading-none mt-0.5">
                          Demo {currentRole}
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
                    </button>

                    {personaDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Demo Persona Switcher
                          </p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                            Local Data
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto py-1">
                          {availableProfiles.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                switchProfile(p.id);
                                setPersonaDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                                p.id === currentProfile?.id
                                  ? 'bg-[#E8F0FE] font-semibold text-[#1967D2]'
                                  : 'text-slate-700'
                              }`}
                            >
                              <div>
                                <div className="font-medium">{p.full_name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {p.institution || p.email}
                                </div>
                              </div>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                                {p.role}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-slate-100 mt-1 pt-1.5 px-3 py-1.5">
                          <p className="text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
                            Switch Active Demo Role
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 mb-2">
                            <Button
                              size="sm"
                              variant={currentRole === 'student' ? 'primary' : 'outline'}
                              onClick={() => {
                                switchRole('student');
                                onNavigate('dashboard');
                                setPersonaDropdownOpen(false);
                              }}
                            >
                              Student
                            </Button>
                            <Button
                              size="sm"
                              variant={currentRole === 'recruiter' ? 'primary' : 'outline'}
                              onClick={() => {
                                switchRole('recruiter');
                                onNavigate('recruiter-dashboard');
                                setPersonaDropdownOpen(false);
                              }}
                            >
                              Recruiter
                            </Button>
                          </div>

                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs text-[#1967D2]"
                              onClick={() => handleOpenAuth('login')}
                              icon={<LogIn className="w-3.5 h-3.5 text-[#1967D2]" />}
                            >
                              Sign In with Real Supabase
                            </Button>

                            <button
                              onClick={() => {
                                exitDemoMode();
                                setPersonaDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-amber-800 hover:bg-amber-50 font-semibold rounded-lg cursor-pointer transition-colors"
                            >
                              <LogOut className="w-3.5 h-3.5 text-amber-700" /> Exit Demo to Landing Page
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenAuth('login')}
                    icon={<LogIn className="w-3.5 h-3.5" />}
                    className="hidden sm:inline-flex text-xs"
                  >
                    Sign In
                  </Button>
                </div>
              ) : (
                /* Unauthenticated Visitor */
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => enterDemoMode()}
                    className="text-xs text-amber-800 hover:bg-amber-50 border border-amber-200"
                    icon={<Database className="w-3.5 h-3.5 text-amber-600" />}
                  >
                    Demo Mode
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAuth('login')}
                    className="text-xs"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenAuth('signup')}
                    className="text-xs"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile menu trigger */}
              {currentRole !== 'visitor' && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && currentRole !== 'visitor' && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top duration-200">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                    isActive
                      ? 'bg-[#E8F0FE] text-[#1967D2]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}

            {isDemoMode && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    exitDemoMode();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-amber-700" /> Exit Demo to Landing Page
                </button>
              </div>
            )}

            {authUser && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Sign Out to Visitor Page
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authModalMode}
        />
      )}
    </>
  );
};
