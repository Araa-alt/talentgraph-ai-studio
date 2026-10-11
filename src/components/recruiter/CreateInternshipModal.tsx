import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { Internship, Skill, WorkMode } from '../../types/database';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';

export interface CreateInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingInternship?: Internship | null;
}

export const CreateInternshipModal: React.FC<CreateInternshipModalProps> = ({
  isOpen,
  onClose,
  existingInternship,
}) => {
  const { currentProfile, isDemoMode } = useAuth();
  const { skills: catalogSkills, createInternship, updateInternship } = useTalentGraph();
  const isPendingApproval = !isDemoMode && currentProfile?.role === 'recruiter' && currentProfile?.is_approved === false;

  const [title, setTitle] = useState(existingInternship?.title || '');
  const [organization, setOrganization] = useState(
    existingInternship?.organization || currentProfile?.institution || 'NovaScale Technologies'
  );
  const [location, setLocation] = useState(existingInternship?.location || 'Bangalore / Remote');
  const [workMode, setWorkMode] = useState<WorkMode>(existingInternship?.work_mode || 'remote');
  const [duration, setDuration] = useState(existingInternship?.duration || '6 Months');
  const [stipend, setStipend] = useState(existingInternship?.stipend || '₹40,000 / month');
  const [deadline, setDeadline] = useState(
    existingInternship?.deadline || '2026-12-31'
  );
  const [applicationUrl, setApplicationUrl] = useState(
    existingInternship?.application_url || 'https://careers.example.com/apply'
  );
  const [description, setDescription] = useState(existingInternship?.description || '');
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    existingInternship?.responsibilities.join('\n') || ''
  );

  // Eligibility criteria
  const [eligibleDegreesText, setEligibleDegreesText] = useState(
    existingInternship?.eligible_degrees.join(', ') || 'B.Tech, B.E., BS in Computer Science'
  );
  const [eligibleGradYearsText, setEligibleGradYearsText] = useState(
    existingInternship?.eligible_grad_years.join(', ') || '2026, 2027'
  );
  const [eligibleMinYear, setEligibleMinYear] = useState(
    existingInternship?.eligible_min_year || 3
  );

  const [requiredSkills, setRequiredSkills] = useState<Skill[]>(
    existingInternship?.required_skills || []
  );
  const [preferredSkills, setPreferredSkills] = useState<Skill[]>(
    existingInternship?.preferred_skills || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRequiredSkill = (skill: Skill) => {
    if (requiredSkills.some((s) => s.id === skill.id)) {
      setRequiredSkills(requiredSkills.filter((s) => s.id !== skill.id));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
      setPreferredSkills(preferredSkills.filter((s) => s.id !== skill.id));
    }
  };

  const togglePreferredSkill = (skill: Skill) => {
    if (preferredSkills.some((s) => s.id === skill.id)) {
      setPreferredSkills(preferredSkills.filter((s) => s.id !== skill.id));
    } else {
      setPreferredSkills([...preferredSkills, skill]);
      setRequiredSkills(requiredSkills.filter((s) => s.id !== skill.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPendingApproval) return;
    if (!title.trim() || !organization.trim() || !currentProfile) return;

    setIsSubmitting(true);
    try {
      const responsibilities = responsibilitiesText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const eligible_degrees = eligibleDegreesText
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const eligible_grad_years = eligibleGradYearsText
        .split(',')
        .map((y) => parseInt(y.trim()))
        .filter((y) => !isNaN(y));

      if (existingInternship) {
        await updateInternship({
          ...existingInternship,
          title,
          organization,
          location,
          work_mode: workMode,
          duration,
          stipend,
          deadline,
          application_url: applicationUrl,
          description,
          responsibilities,
          eligible_degrees,
          eligible_grad_years,
          eligible_min_year: Number(eligibleMinYear),
          required_skills: requiredSkills,
          preferred_skills: preferredSkills,
        });
      } else {
        await createInternship({
          recruiter_id: currentProfile.id,
          title,
          organization,
          location,
          work_mode: workMode,
          duration,
          stipend,
          deadline,
          application_url: applicationUrl,
          description,
          responsibilities,
          status: 'active',
          eligible_degrees,
          eligible_grad_years,
          eligible_min_year: Number(eligibleMinYear),
          required_skills: requiredSkills,
          preferred_skills: preferredSkills,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingInternship ? 'Edit Internship Listing' : 'Post New Internship Opportunity'}
      description="Define requirements, verified skill thresholds, and hard eligibility constraints."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isPendingApproval && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <strong>Approval Required:</strong> Your recruiter account is pending administrator verification. You cannot post or modify listings until approved.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Role Title"
            placeholder="e.g. Frontend Engineer Intern"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Organization / Company"
            placeholder="e.g. NovaScale Technologies"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Location"
            placeholder="e.g. Bangalore"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <Select
            label="Work Mode"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value as WorkMode)}
            options={[
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'onsite', label: 'On-site' },
            ]}
          />
          <Input
            label="Duration"
            placeholder="e.g. 6 Months"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Stipend"
            placeholder="e.g. ₹40,000 / month"
            value={stipend}
            onChange={(e) => setStipend(e.target.value)}
          />
          <Input
            label="Application Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Application Portal URL"
            placeholder="https://company.com/apply"
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Role Description"
          rows={3}
          placeholder="Summarize the team, mission, and scope of work..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <Textarea
          label="Responsibilities (One per line)"
          rows={3}
          placeholder="Build reusable components in React&#10;Optimize client-side query performance"
          value={responsibilitiesText}
          onChange={(e) => setResponsibilitiesText(e.target.value)}
        />

        {/* Eligibility criteria */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Mandatory Eligibility Rules
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Accepted Degrees (comma-separated)"
              placeholder="B.Tech, B.E., BS"
              value={eligibleDegreesText}
              onChange={(e) => setEligibleDegreesText(e.target.value)}
              helperText="Candidate profiles must match one"
            />
            <Input
              label="Graduation Years (comma-separated)"
              placeholder="2026, 2027"
              value={eligibleGradYearsText}
              onChange={(e) => setEligibleGradYearsText(e.target.value)}
            />
            <Select
              label="Minimum Academic Year"
              value={eligibleMinYear}
              onChange={(e) => setEligibleMinYear(Number(e.target.value))}
              options={[
                { value: 1, label: 'Year 1+' },
                { value: 2, label: 'Year 2+' },
                { value: 3, label: 'Year 3+' },
                { value: 4, label: 'Year 4+' },
              ]}
            />
          </div>
        </div>

        {/* Required Skills selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Required Technical Skills (Heavily weighted in matching)
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 max-h-28 overflow-y-auto">
            {catalogSkills.map((sk) => {
              const isReq = requiredSkills.some((s) => s.id === sk.id);
              return (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => toggleRequiredSkill(sk)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isReq
                      ? 'bg-[#4285F4] text-white border-[#4285F4]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isReq ? `✓ ${sk.name}` : sk.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Skills selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Preferred / Bonus Skills (Nice-to-have)
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 max-h-28 overflow-y-auto">
            {catalogSkills.map((sk) => {
              const isPref = preferredSkills.some((s) => s.id === sk.id);
              return (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => togglePreferredSkill(sk)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isPref
                      ? 'bg-[#34A853] text-white border-[#34A853]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isPref ? `★ ${sk.name}` : sk.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isPendingApproval}
            isLoading={isSubmitting}
          >
            {isPendingApproval ? 'Approval Pending' : existingInternship ? 'Update Listing' : 'Publish Internship'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
