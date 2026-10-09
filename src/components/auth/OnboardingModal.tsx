import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { UserRole, WorkMode } from '../../types/database';
import { GraduationCap, Building, Sparkles, ArrowRight } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { authUser, currentRole, completeOnboarding, needsOnboarding } = useAuth();

  const [role, setRole] = useState<UserRole>(
    (authUser?.user_metadata?.role as UserRole) || (currentRole !== 'visitor' ? currentRole : 'student')
  );
  const [fullName, setFullName] = useState(
    authUser?.user_metadata?.full_name || ''
  );
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science & Engineering');
  const [currentYear, setCurrentYear] = useState<number>(3);
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [preferredWorkModes, setPreferredWorkModes] = useState<WorkMode[]>(['remote', 'hybrid']);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!needsOnboarding) return null;

  const toggleWorkMode = (mode: WorkMode) => {
    if (preferredWorkModes.includes(mode)) {
      if (preferredWorkModes.length > 1) {
        setPreferredWorkModes(preferredWorkModes.filter((m) => m !== mode));
      }
    } else {
      setPreferredWorkModes([...preferredWorkModes, mode]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please provide your full name.');
      return;
    }

    if (!institution.trim()) {
      setErrorMsg(
        role === 'student'
          ? 'Please provide your university or educational institution.'
          : 'Please provide your company or organization name.'
      );
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      await completeOnboarding({
        full_name: fullName.trim(),
        role,
        institution: institution.trim(),
        degree: role === 'student' ? degree : undefined,
        field_of_study: role === 'student' ? fieldOfStudy : undefined,
        current_year: role === 'student' ? Number(currentYear) : undefined,
        graduation_year: role === 'student' ? Number(graduationYear) : undefined,
        bio: bio.trim(),
        github_url: githubUrl.trim() || undefined,
        portfolio_url: portfolioUrl.trim() || undefined,
        preferred_work_modes: preferredWorkModes,
        preferred_roles:
          role === 'student'
            ? ['Software Engineer Intern', 'Frontend Developer', 'Full Stack Builder']
            : [],
        preferred_locations: ['Remote', 'Bangalore', 'Hyderabad'],
      });
    } catch (err: any) {
      console.error('Failed to complete onboarding', err);
      setErrorMsg(err.message || 'Failed to initialize profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={needsOnboarding}
      onClose={() => {}} // Non-dismissible until completed
      title="Complete Your TalentGraph Profile"
      description={`Welcome ${authUser?.email || ''}! Setup your verified profile to start matching.`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <Alert type="error" title="Error">{errorMsg}</Alert>}

        {/* Role Confirmation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Account Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                role === 'student'
                  ? 'border-[#4285F4] bg-[#E8F0FE]/70 ring-2 ring-[#4285F4]/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <GraduationCap
                className={`w-5 h-5 shrink-0 ${
                  role === 'student' ? 'text-[#1967D2]' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="font-bold text-xs text-slate-900">Student Builder</div>
                <div className="text-[10px] text-slate-500">Apply &amp; verify project evidence</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                role === 'recruiter'
                  ? 'border-[#34A853] bg-[#E6F4EA]/70 ring-2 ring-[#34A853]/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Building
                className={`w-5 h-5 shrink-0 ${
                  role === 'recruiter' ? 'text-[#137333]' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="font-bold text-xs text-slate-900">Recruiter / Employer</div>
                <div className="text-[10px] text-slate-500">Post roles &amp; rank candidates</div>
              </div>
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          placeholder="e.g. Alex Rivera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        {role === 'student' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Educational Institution"
                placeholder="e.g. Apex Institute of Technology"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              />
              <Select
                label="Degree Program"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                options={[
                  { value: 'B.Tech', label: 'B.Tech / B.E.' },
                  { value: 'B.S.', label: 'B.S. in Computer Science' },
                  { value: 'M.Tech', label: 'M.Tech / M.E.' },
                  { value: 'MCA', label: 'MCA' },
                  { value: 'MS', label: 'MS in Computer Science' },
                  { value: 'Other', label: 'Other Degree' },
                ]}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Field of Study"
                placeholder="e.g. Computer Science"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                required
              />
              <Select
                label="Current Academic Year"
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                options={[
                  { value: 1, label: 'Year 1' },
                  { value: 2, label: 'Year 2' },
                  { value: 3, label: 'Year 3' },
                  { value: 4, label: 'Year 4' },
                  { value: 5, label: 'Year 5 / Postgrad' },
                ]}
              />
              <Input
                label="Graduation Year"
                type="number"
                min={2024}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="GitHub Profile URL (Optional)"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <Input
                label="Portfolio / Website URL (Optional)"
                placeholder="https://portfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <Input
              label="Company or Organization"
              placeholder="e.g. NovaScale Technologies"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            />
            <Input
              label="Company Website or Careers Page"
              placeholder="https://company.example.com"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </>
        )}

        {/* Preferred Work Modes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Preferred Work Modes
          </label>
          <div className="flex gap-2">
            {(['remote', 'hybrid', 'onsite'] as WorkMode[]).map((mode) => {
              const active = preferredWorkModes.includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleWorkMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                    active
                      ? 'bg-[#E8F0FE] text-[#1967D2] border-[#4285F4]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <Textarea
          label="Bio / Professional Summary"
          placeholder={
            role === 'student'
              ? 'Tell recruiters about your core interests, systems built, or career focus...'
              : 'Briefly describe your team, hiring priorities, and company mission...'
          }
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="pt-3 border-t border-slate-200">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            isLoading={submitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Save Profile &amp; Enter Platform
          </Button>
          <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#4285F4]" />
            Your profile will be directly bound to your Supabase Auth account.
          </p>
        </div>
      </form>
    </Modal>
  );
};
