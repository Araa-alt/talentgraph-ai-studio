import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { db } from '../../lib/db';
import { HackathonExperience, Skill } from '../../types/database';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Plus, Award, ExternalLink, Trash2, Edit2, Calendar } from 'lucide-react';

export const HackathonManager: React.FC = () => {
  const { currentProfile, updateCurrentProfile } = useAuth();
  const { skills: catalogSkills } = useTalentGraph();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHack, setEditingHack] = useState<HackathonExperience | null>(null);

  const [eventName, setEventName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [role, setRole] = useState('');
  const [contribution, setContribution] = useState('');
  const [achievement, setAchievement] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentProfile) return null;

  const openCreateModal = () => {
    setEditingHack(null);
    setEventName('');
    setProjectName('');
    setRole('Full Stack Contributor');
    setContribution('');
    setAchievement('');
    setRepoUrl('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setSelectedSkills([]);
    setIsModalOpen(true);
  };

  const openEditModal = (h: HackathonExperience) => {
    setEditingHack(h);
    setEventName(h.event_name);
    setProjectName(h.project_name);
    setRole(h.role);
    setContribution(h.contribution);
    setAchievement(h.achievement || '');
    setRepoUrl(h.repo_url || '');
    setEventDate(h.event_date || '');
    setSelectedSkills(h.skills || []);
    setIsModalOpen(true);
  };

  const toggleSkill = (skill: Skill) => {
    if (selectedSkills.some((s) => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter((s) => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !projectName.trim()) return;

    setIsSaving(true);
    try {
      if (editingHack) {
        await db.updateHackathon({
          ...editingHack,
          event_name: eventName,
          project_name: projectName,
          role,
          contribution,
          achievement,
          repo_url: repoUrl,
          event_date: eventDate,
          skills: selectedSkills,
        });
      } else {
        await db.addHackathon(currentProfile.id, {
          profile_id: currentProfile.id,
          event_name: eventName,
          project_name: projectName,
          role,
          contribution,
          achievement,
          repo_url: repoUrl,
          event_date: eventDate,
          skills: selectedSkills,
        });
      }

      // Upgrade profile skills to hackathon_backed if not already project_backed
      for (const sk of selectedSkills) {
        const existingPs = (currentProfile.skills || []).find((s) => s.skill_id === sk.id);
        const evidence_type = existingPs?.evidence_type === 'project_backed' ? 'project_backed' : 'hackathon_backed';

        await db.saveProfileSkill(currentProfile.id, {
          profile_id: currentProfile.id,
          skill_id: sk.id,
          skill: sk,
          proficiency_level: existingPs?.proficiency_level || 'intermediate',
          evidence_type,
        });
      }

      const refreshed = await db.getProfile(currentProfile.id);
      if (refreshed) {
        await updateCurrentProfile(refreshed);
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this hackathon entry?')) {
      await db.deleteHackathon(currentProfile.id, id);
      const refreshed = await db.getProfile(currentProfile.id);
      if (refreshed) {
        await updateCurrentProfile(refreshed);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FBBC05]" /> Hackathons &amp; Competitions ({currentProfile.hackathons?.length || 0})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrate your ability to build under tight time constraints.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4 text-[#FBBC05]" />}
        >
          Add Hackathon
        </Button>
      </div>

      {(currentProfile.hackathons || []).length === 0 ? (
        <Card className="text-center py-8 border-dashed border-2 border-slate-200">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700">No hackathon experience added</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
            Add team sprints, design jams, or hackathon deliverables to strengthen your profile.
          </p>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            Add First Hackathon
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentProfile.hackathons.map((h) => (
            <Card key={h.id} className="border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{h.event_name}</h4>
                    <span className="text-xs font-semibold text-[#4285F4]">
                      Project: {h.project_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(h)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50"
                      title="Edit hackathon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Delete hackathon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  <span>Role: {h.role}</span>
                  {h.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(h.event_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {h.achievement && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3] text-xs font-semibold mb-3">
                    🏆 {h.achievement}
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-3">
                  <strong className="text-slate-700">Sprint Contribution:</strong>
                  <p className="text-slate-600 mt-0.5">{h.contribution}</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {(h.skills || []).map((sk) => (
                    <Badge key={sk.id} variant="green" size="sm">
                      {sk.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {h.repo_url && (
                <div className="pt-3 border-t border-slate-100 flex items-center text-xs">
                  <a
                    href={h.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1A73E8] hover:underline flex items-center gap-1"
                  >
                    Hackathon Submission Repo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Hackathon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHack ? 'Edit Hackathon Entry' : 'Add Hackathon Experience'}
        description="Detail your sprint contributions and applied technologies."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hackathon Name"
              placeholder="e.g. HackSprint 2026"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
            <Input
              label="Project / Submission Name"
              placeholder="e.g. HealthSync IoT Gateway"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Your Role"
              placeholder="e.g. Backend Lead"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
            <Input
              label="Date of Event"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <Input
            label="Achievement / Recognition (Optional)"
            placeholder="e.g. 1st Place - Web3 Track, Finalist (Top 10)"
            value={achievement}
            onChange={(e) => setAchievement(e.target.value)}
          />

          <Textarea
            label="Your Contribution"
            rows={2}
            placeholder="What did you build during the 24-48 hour window?"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            required
          />

          <Input
            label="Repository or Devpost Link"
            placeholder="https://github.com/..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Skills Utilized in Sprint
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
              {catalogSkills.map((sk) => {
                const isSelected = selectedSkills.some((s) => s.id === sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-[#34A853] text-white border-[#34A853]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? `✓ ${sk.name}` : sk.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              Save Hackathon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
