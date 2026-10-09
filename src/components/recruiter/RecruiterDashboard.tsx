import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { Internship } from '../../types/database';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CreateInternshipModal } from './CreateInternshipModal';
import {
  Building,
  Plus,
  Users,
  BookmarkCheck,
  Edit2,
  Lock,
  Unlock,
} from 'lucide-react';

export interface RecruiterDashboardProps {
  onNavigate: (view: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onNavigate }) => {
  const { currentProfile, isDemoMode } = useAuth();
  const { internships, shortlists, updateInternship } = useTalentGraph();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);

  // Recruiter's listings (Strictly isolated by current user ID when authenticated)
  const myListings = useMemo(() => {
    if (!currentProfile) return [];
    return internships.filter((i) =>
      i.recruiter_id === currentProfile.id || (isDemoMode && i.recruiter_id === 'rec-marcus-1')
    );
  }, [internships, currentProfile, isDemoMode]);

  const toggleListingStatus = async (internship: Internship) => {
    const newStatus = internship.status === 'active' ? 'closed' : 'active';
    await updateInternship({ ...internship, status: newStatus });
  };

  const handleEdit = (internship: Internship) => {
    setEditingInternship(internship);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#E8F0FE]/40 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#1967D2] uppercase tracking-wider">
              TalentGraph Recruiter Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Recruiter Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {currentProfile?.full_name} • {currentProfile?.institution || 'NovaScale Technologies'}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingInternship(null);
              setIsCreateModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Post New Internship
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{myListings.length}</div>
            <div className="text-xs text-slate-500 font-medium">Internship Listings</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] text-[#188038] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {myListings.filter((i) => i.status === 'active').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Opportunities</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-[#FEF7E0] text-[#B06000] flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{shortlists.length}</div>
            <div className="text-xs text-slate-500 font-medium">Shortlisted Candidates</div>
          </div>
        </Card>
      </div>

      {/* Manage Listings Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Manage Internship Listings
            </h2>
            <p className="text-xs text-slate-500">
              Review active listings, edit criteria, or evaluate incoming candidate rankings.
            </p>
          </div>
        </div>

        {myListings.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-slate-200">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No listings posted yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create your first internship listing to start matching with vetted student talent.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingInternship(null);
                setIsCreateModalOpen(true);
              }}
            >
              Post Internship
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {myListings.map((intern) => (
              <Card key={intern.id} className="p-4 border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{intern.title}</h3>
                      <Badge
                        variant={intern.status === 'active' ? 'green' : 'neutral'}
                        size="sm"
                      >
                        {intern.status.toUpperCase()}
                      </Badge>
                      <Badge variant="blue" size="sm">
                        {intern.work_mode.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>{intern.organization}</span>
                      <span>{intern.location}</span>
                      <span>{intern.duration}</span>
                      {intern.stipend && <span className="font-medium text-slate-700">{intern.stipend}</span>}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {intern.required_skills.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onNavigate('candidate-discovery')}
                    >
                      <Users className="w-3.5 h-3.5 mr-1" />
                      View Ranked Candidates
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(intern)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleListingStatus(intern)}
                      icon={intern.status === 'active' ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <Unlock className="w-3.5 h-3.5 text-[#188038]" />}
                      title={intern.status === 'active' ? 'Close listing' : 'Reactivate listing'}
                    >
                      {intern.status === 'active' ? 'Close' : 'Reopen'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateInternshipModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingInternship(null);
        }}
        existingInternship={editingInternship}
      />
    </div>
  );
};
