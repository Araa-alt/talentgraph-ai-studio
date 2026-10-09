import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { db } from '../../lib/db';
import { ProfileEditor } from './ProfileEditor';
import { ProjectManager } from './ProjectManager';
import { HackathonManager } from './HackathonManager';
import { Tabs } from '../common/Tabs';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Select } from '../common/Input';
import { User, Briefcase, Award, Plus, Sparkles } from 'lucide-react';
import { ProficiencyLevel } from '../../types/database';

export const MyProfile: React.FC = () => {
  const { currentProfile, updateCurrentProfile } = useAuth();
  const { skills: catalogSkills } = useTalentGraph();
  const [activeTab, setActiveTab] = useState('profile');

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('intermediate');

  if (!currentProfile) return null;

  const tabs = [
    { id: 'profile', label: 'Academic & Preferences', icon: <User className="w-4 h-4" /> },
    {
      id: 'projects',
      label: 'Technical Projects',
      count: currentProfile.projects?.length || 0,
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'hackathons',
      label: 'Hackathon Sprints',
      count: currentProfile.hackathons?.length || 0,
      icon: <Award className="w-4 h-4" />,
    },
  ];

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    const skillObj = catalogSkills.find((s) => s.id === selectedSkillId);
    if (!skillObj) return;

    await db.saveProfileSkill(currentProfile.id, {
      profile_id: currentProfile.id,
      skill_id: skillObj.id,
      skill: skillObj,
      proficiency_level: proficiency,
      evidence_type: 'self_declared',
    });

    const refreshed = await db.getProfile(currentProfile.id);
    if (refreshed) {
      await updateCurrentProfile(refreshed);
    }
    setIsSkillModalOpen(false);
  };

  const handleRemoveSkill = async (skillId: string) => {
    await db.removeProfileSkill(currentProfile.id, skillId);
    const refreshed = await db.getProfile(currentProfile.id);
    if (refreshed) {
      await updateCurrentProfile(refreshed);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Profile &amp; Evidence Portfolio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Maintain your credentials, target preferences, and code deliverables for transparent internship matching.
        </p>
      </div>

      {/* Skills Bar Header */}
      <Card className="border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" /> Technical Skills Inventory
            </h3>
            <p className="text-xs text-slate-500">
              Skills marked with 📁 or 🏆 carry verified project/hackathon evidence in your ranking.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSkillModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-[#4285F4]" />}
          >
            Declare Skill
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(currentProfile.skills || []).map((ps) => (
            <div
              key={ps.skill_id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-sm"
            >
              <span>{ps.skill.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">({ps.proficiency_level})</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  ps.evidence_type === 'project_backed'
                    ? 'bg-[#E8F0FE] text-[#1967D2]'
                    : ps.evidence_type === 'hackathon_backed'
                    ? 'bg-[#E6F4EA] text-[#137333]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {ps.evidence_type === 'project_backed'
                  ? '📁 Project'
                  : ps.evidence_type === 'hackathon_backed'
                  ? '🏆 Hackathon'
                  : 'Self-Declared'}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(ps.skill_id)}
                className="ml-1 text-slate-400 hover:text-red-600 text-sm leading-none"
                title="Remove skill"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Sub Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div>
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'projects' && <ProjectManager />}
        {activeTab === 'hackathons' && <HackathonManager />}
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title="Declare New Technical Skill"
        description="Choose a technology from our normalized dictionary."
        maxWidth="md"
      >
        <form onSubmit={handleAddSkill} className="space-y-4">
          <Select
            label="Select Technical Skill"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            required
            options={[
              { value: '', label: '-- Choose Skill --' },
              ...catalogSkills
                .filter(
                  (cs) => !(currentProfile.skills || []).some((ps) => ps.skill_id === cs.id)
                )
                .map((s) => ({ value: s.id, label: `${s.name} (${s.category || 'General'})` })),
            ]}
          />

          <Select
            label="Self-Declared Proficiency Level"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
            options={[
              { value: 'beginner', label: 'Beginner — Basic concepts & toy scripts' },
              { value: 'intermediate', label: 'Intermediate — Built small apps or features' },
              { value: 'advanced', label: 'Advanced — Production architecture & optimization' },
            ]}
          />

          <p className="text-xs text-slate-500">
            Note: Associating this skill with a project will elevate it from "Self-Declared" to "Project-Backed" evidence.
          </p>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="md" onClick={() => setIsSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Add to Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
