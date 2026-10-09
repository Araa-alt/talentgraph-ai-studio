import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { UserRole } from '../../types/database';
import { Alert } from '../common/Alert';
import { GraduationCap, Building, Sparkles, Lock, Mail, User, ArrowRight } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { signIn, signUp, enterDemoMode, isSupabaseConnected } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setSubmitting(false);
          return;
        }

        const res = await signUp(email, password, role, fullName.trim());
        if (res.success) {
          if (res.requiresEmailConfirmation) {
            setSuccessNotice(
              'Account created! Please check your email to confirm your account before logging in.'
            );
          } else {
            onClose();
          }
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoModeClick = () => {
    enterDemoMode();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Welcome Back to TalentGraph' : 'Create TalentGraph Account'}
      description={
        mode === 'login'
          ? 'Sign in with your verified Supabase credentials.'
          : 'Join as a student builder or recruiter seeking evidenced talent.'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {!isSupabaseConnected && (
          <Alert type="warning" title="Supabase Environment Not Configured">
            No active VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY found in environment. You can test all features right now using Demo Mode.
          </Alert>
        )}

        {errorMessage && (
          <Alert type="error" title="Authentication Error">
            {errorMessage}
          </Alert>
        )}

        {successNotice && (
          <Alert type="info" title="Check Your Inbox">
            {successNotice}
          </Alert>
        )}

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'login'
                ? 'border-[#4285F4] text-[#1967D2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'signup'
                ? 'border-[#4285F4] text-[#1967D2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  I am joining as a:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      role === 'student'
                        ? 'border-[#4285F4] bg-[#E8F0FE]/60 ring-2 ring-[#4285F4]/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <GraduationCap
                      className={`w-5 h-5 shrink-0 ${
                        role === 'student' ? 'text-[#1967D2]' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">Student Candidate</div>
                      <div className="text-[10px] text-slate-500">Discover matching internships</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      role === 'recruiter'
                        ? 'border-[#34A853] bg-[#E6F4EA]/60 ring-2 ring-[#34A853]/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building
                      className={`w-5 h-5 shrink-0 ${
                        role === 'recruiter' ? 'text-[#137333]' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">Recruiter / Talent Lead</div>
                      <div className="text-[10px] text-slate-500">Post &amp; rank vetted talent</div>
                    </div>
                  </button>
                </div>
              </div>

              <Input
                label="Full Name"
                placeholder="e.g. Jordan Miller"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText={mode === 'signup' ? 'Minimum 6 characters.' : undefined}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'login' ? 'Sign In to TalentGraph' : 'Register & Setup Profile'}
            </Button>
          </div>
        </form>

        {/* Demo Mode Fallback Option */}
        <div className="pt-3 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 mb-2">
            Want to test without Supabase credentials?
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDemoModeClick}
            className="w-full justify-center text-xs"
            icon={<Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />}
          >
            Launch Interactive Demo Mode (Local Data)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
