import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Profile, WorkMode } from '../../types/database';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Check, Save, GraduationCap, Link2, Sparkles } from 'lucide-react';

export const ProfileEditor: React.FC = () => {
  const { currentProfile, updateCurrentProfile } = useAuth();

  const [form, setForm] = useState<Partial<Profile>>({
    full_name: currentProfile?.full_name || '',
    institution: currentProfile?.institution || '',
    degree: currentProfile?.degree || '',
    field_of_study: currentProfile?.field_of_study || '',
    current_year: currentProfile?.current_year || 3,
    graduation_year: currentProfile?.graduation_year || 2026,
    bio: currentProfile?.bio || '',
    preferred_roles: currentProfile?.preferred_roles || [],
    preferred_locations: currentProfile?.preferred_locations || [],
    preferred_work_modes: currentProfile?.preferred_work_modes || ['remote', 'hybrid'],
    github_url: currentProfile?.github_url || '',
    portfolio_url: currentProfile?.portfolio_url || '',
    resume_url: currentProfile?.resume_url || '',
  });

  const [roleInput, setRoleInput] = useState('');
  const [locInput, setLocInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentProfile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCurrentProfile({
        ...currentProfile,
        ...form,
      } as Profile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addRole = () => {
    if (roleInput.trim() && !form.preferred_roles?.includes(roleInput.trim())) {
      setForm((prev) => ({
        ...prev,
        preferred_roles: [...(prev.preferred_roles || []), roleInput.trim()],
      }));
      setRoleInput('');
    }
  };

  const removeRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      preferred_roles: (prev.preferred_roles || []).filter((r) => r !== role),
    }));
  };

  const addLocation = () => {
    if (locInput.trim() && !form.preferred_locations?.includes(locInput.trim())) {
      setForm((prev) => ({
        ...prev,
        preferred_locations: [...(prev.preferred_locations || []), locInput.trim()],
      }));
      setLocInput('');
    }
  };

  const removeLocation = (loc: string) => {
    setForm((prev) => ({
      ...prev,
      preferred_locations: (prev.preferred_locations || []).filter((l) => l !== loc),
    }));
  };

  const toggleWorkMode = (mode: WorkMode) => {
    const current = form.preferred_work_modes || [];
    if (current.includes(mode)) {
      setForm({ ...form, preferred_work_modes: current.filter((m) => m !== mode) });
    } else {
      setForm({ ...form, preferred_work_modes: [...current, mode] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal & Academic Details */}
      <Card className="border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#4285F4]" /> Academic Background &amp; Credentials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />

          <Input
            label="College / Institution"
            placeholder="e.g. Apex Institute of Technology"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            required
          />

          <Input
            label="Degree Program"
            placeholder="e.g. B.Tech, B.E., BS in Computer Science"
            value={form.degree}
            onChange={(e) => setForm({ ...form, degree: e.target.value })}
            helperText="Used for hard eligibility verification by recruiters"
            required
          />

          <Input
            label="Field of Study / Branch"
            placeholder="e.g. Computer Science & Engineering"
            value={form.field_of_study}
            onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
          />

          <Select
            label="Current Year of Study"
            value={form.current_year}
            onChange={(e) => setForm({ ...form, current_year: Number(e.target.value) })}
            options={[
              { value: 1, label: '1st Year (Freshman)' },
              { value: 2, label: '2nd Year (Sophomore)' },
              { value: 3, label: '3rd Year (Junior)' },
              { value: 4, label: '4th Year (Senior)' },
              { value: 5, label: '5th Year (Dual Degree / Grad)' },
            ]}
          />

          <Select
            label="Graduation Year"
            value={form.graduation_year}
            onChange={(e) => setForm({ ...form, graduation_year: Number(e.target.value) })}
            options={[
              { value: 2024, label: '2024' },
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
              { value: 2027, label: '2027' },
              { value: 2028, label: '2028' },
            ]}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Professional Bio"
            rows={2}
            placeholder="Tell recruiters about your interests, technical focus, and goals..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
      </Card>

      {/* Role & Location Preferences */}
      <Card className="border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#34A853]" /> Target Roles &amp; Work Preferences
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Roles (Press Add or Enter)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Frontend Engineer, Full Stack Intern..."
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRole();
                  }
                }}
              />
              <Button type="button" variant="outline" size="md" onClick={addRole}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(form.preferred_roles || []).map((r) => (
                <Badge key={r} variant="blue" size="md">
                  {r}
                  <button
                    type="button"
                    onClick={() => removeRole(r)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Locations
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Bangalore, Hyderabad, Remote..."
                value={locInput}
                onChange={(e) => setLocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLocation();
                  }
                }}
              />
              <Button type="button" variant="outline" size="md" onClick={addLocation}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(form.preferred_locations || []).map((l) => (
                <Badge key={l} variant="neutral" size="md">
                  {l}
                  <button
                    type="button"
                    onClick={() => removeLocation(l)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Acceptable Work Modes
            </label>
            <div className="flex gap-2">
              {(['remote', 'hybrid', 'onsite'] as WorkMode[]).map((mode) => {
                const isSelected = form.preferred_work_modes?.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => toggleWorkMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      isSelected
                        ? 'bg-[#4285F4] text-white border-[#4285F4] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Online Profiles & Links */}
      <Card className="border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[#FBBC05]" /> Links &amp; Evidence Profiles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="GitHub Profile URL"
            placeholder="https://github.com/username"
            value={form.github_url}
            onChange={(e) => setForm({ ...form, github_url: e.target.value })}
          />

          <Input
            label="Portfolio / Personal Website"
            placeholder="https://yourname.dev"
            value={form.portfolio_url}
            onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedSuccess && (
          <span className="text-xs text-[#188038] font-semibold flex items-center gap-1 animate-in fade-in">
            <Check className="w-4 h-4" /> Profile saved successfully!
          </span>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSaving}
          icon={<Save className="w-4 h-4" />}
        >
          Save Profile Changes
        </Button>
      </div>
    </form>
  );
};
