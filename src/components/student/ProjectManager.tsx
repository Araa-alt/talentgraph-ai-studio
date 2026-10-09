import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { db } from '../../lib/db';
import { Project, Skill } from '../../types/database';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Plus, Briefcase, ExternalLink, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const { currentProfile, updateCurrentProfile } = useAuth();
  const { skills: catalogSkills } = useTalentGraph();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [contribution, setContribution] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentProfile) return null;

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setRole('Lead Developer');
    setContribution('');
    setOutcomes('');
    setRepoUrl('');
    setLiveUrl('');
    setSelectedSkills([]);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description);
    setRole(proj.role);
    setContribution(proj.contribution);
    setOutcomes(proj.outcomes || '');
    setRepoUrl(proj.repo_url || '');
    setLiveUrl(proj.live_url || '');
    setSelectedSkills(proj.skills || []);
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
    if (!title.trim() || !contribution.trim()) return;

    setIsSaving(true);
    try {
      if (editingProject) {
        await db.updateProject({
          ...editingProject,
          title,
          description,
          role,
          contribution,
          outcomes,
          repo_url: repoUrl,
          live_url: liveUrl,
          skills: selectedSkills,
        });
      } else {
        await db.addProject(currentProfile.id, {
          profile_id: currentProfile.id,
          title,
          description,
          role,
          contribution,
          outcomes,
          repo_url: repoUrl,
          live_url: liveUrl,
          skills: selectedSkills,
        });
      }

      // Upgrade profile skills to project_backed if they match
      for (const sk of selectedSkills) {
        await db.saveProfileSkill(currentProfile.id, {
          profile_id: currentProfile.id,
          skill_id: sk.id,
          skill: sk,
          proficiency_level: 'intermediate',
          evidence_type: 'project_backed',
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
    if (confirm('Are you sure you want to remove this project?')) {
      await db.deleteProject(currentProfile.id, id);
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
            <Briefcase className="w-4 h-4 text-[#4285F4]" /> Technical Projects ({currentProfile.projects?.length || 0})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every project demonstrates tangible technical skills for recruiter match verification.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Project
        </Button>
      </div>

      {(currentProfile.projects || []).length === 0 ? (
        <Card className="text-center py-8 border-dashed border-2 border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700">No projects added yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
            Add a personal or academic project to back your skills with verified evidence.
          </p>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            Add First Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentProfile.projects.map((proj) => (
            <Card key={proj.id} className="border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-sm text-slate-900">{proj.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium mb-2">
                  Role: <span className="text-slate-700">{proj.role}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {proj.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-3">
                  <strong className="text-slate-700">My Contribution:</strong>
                  <p className="text-slate-600 mt-0.5">{proj.contribution}</p>
                </div>

                {proj.outcomes && (
                  <div className="text-xs text-[#137333] font-medium mb-3 flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{proj.outcomes}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  {(proj.skills || []).map((sk) => (
                    <Badge key={sk.id} variant="blue" size="sm">
                      {sk.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                {proj.repo_url && (
                  <a
                    href={proj.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1A73E8] hover:underline flex items-center gap-1"
                  >
                    GitHub Repo <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {proj.live_url && (
                  <a
                    href={proj.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1A73E8] hover:underline flex items-center gap-1"
                  >
                    Live Demo <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project Evidence'}
        description="Detail your real contributions and select demonstrated skills."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Distributed Task Orchestrator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Your Role in Project"
            placeholder="e.g. Lead Frontend Developer / Backend Architect"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />

          <Textarea
            label="Project Description"
            rows={2}
            placeholder="What does the project do and why was it built?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Textarea
            label="Your Specific Contribution"
            rows={2}
            placeholder="What specific components, algorithms, or APIs did you personally implement?"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            required
            helperText="Matching algorithms weigh your actual personal technical deliverables."
          />

          <Input
            label="Measurable Outcomes (Optional)"
            placeholder="e.g. Scaled to 100+ concurrent users, reduced latency by 35%"
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Repository URL"
              placeholder="https://github.com/..."
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <Input
              label="Live Demo URL"
              placeholder="https://..."
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Demonstrated Skills (Click to select)
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
                        ? 'bg-[#4285F4] text-white border-[#4285F4]'
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
              Save Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
