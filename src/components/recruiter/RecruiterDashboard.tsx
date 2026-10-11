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
  Clock,
  Send,
  Calendar,
  GraduationCap,
} from 'lucide-react';

export interface RecruiterDashboardProps {
  onNavigate: (view: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onNavigate }) => {
  const { currentProfile, isDemoMode } = useAuth();
  const { internships, shortlists, recruiterApplications, updateInternship, refreshData } = useTalentGraph();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);

  const isPendingApproval = !isDemoMode && currentProfile?.role === 'recruiter' && currentProfile?.is_approved === false;

  // Recruiter's listings (Strictly isolated by current user ID when authenticated)
  const myListings = useMemo(() => {
    if (!currentProfile) return [];
    return internships.filter((i) =>
      i.recruiter_id === currentProfile.id || (isDemoMode && i.recruiter_id === 'rec-marcus-1')
    );
  }, [internships, currentProfile, isDemoMode]);

  // Direct student applications for this recruiter's listings
  const receivedApplications = useMemo(() => {
    const listingIds = new Set(myListings.map((i) => i.id));
    return recruiterApplications.filter((a) =>
      listingIds.has(a.internship_id) ||
      (a.internship && a.internship.recruiter_id === currentProfile?.id) ||
      (isDemoMode && a.internship?.recruiter_id === 'rec-marcus-1')
    );
  }, [myListings, recruiterApplications, currentProfile?.id, isDemoMode]);

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
      {/* Pending Approval Notice */}
      {isPendingApproval && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm text-amber-900 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-sm">Recruiter Account Pending Administrator Approval</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Your recruiter profile has been submitted and is currently pending verification by a system administrator. Posting new internships and accessing full candidate details are restricted until your account is approved.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#E8F0FE]/40 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1967D2] uppercase tracking-wider">
                TalentGraph Recruiter Portal
              </span>
              {isPendingApproval && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Pending Approval
                </span>
              )}
            </div>
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
            disabled={isPendingApproval}
            title={isPendingApproval ? 'Approval required by administrator to post listings' : 'Post new internship'}
            onClick={() => {
              if (isPendingApproval) return;
              setEditingInternship(null);
              setIsCreateModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            {isPendingApproval ? 'Approval Pending' : 'Post New Internship'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card className="flex items-center gap-4 p-5 border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-[#FCE8E6] text-[#C5221F] flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{receivedApplications.length}</div>
            <div className="text-xs text-slate-500 font-medium">Applications Received</div>
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

      {/* Applications Received Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Send className="w-5 h-5 text-[#4285F4]" />
              Applications Received ({receivedApplications.length})
            </h2>
            <p className="text-xs text-slate-500">
              Live student applications submitted directly to your posted opportunities.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refreshData()}
            className="text-xs text-[#1A73E8]"
          >
            Refresh List
          </Button>
        </div>

        {receivedApplications.length === 0 ? (
          <Card className="text-center py-10 border-dashed border-2 border-slate-200">
            <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No applications received yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When students click "Apply" on your internships in the Student Portal, their application will immediately record here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {receivedApplications.map((app) => {
              const intern = myListings.find((i) => i.id === app.internship_id) || app.internship;
              const student = app.student;
              return (
                <Card key={app.id} className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {student?.full_name ? student.full_name.charAt(0) : 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {student?.full_name || 'Student Applicant'}
                          </h4>
                          <Badge
                            variant={
                              app.status === 'applied'
                                ? 'blue'
                                : app.status === 'offer'
                                ? 'green'
                                : app.status === 'interview'
                                ? 'yellow'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {app.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                          {student?.institution && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              {student.institution}
                            </span>
                          )}
                          {intern && (
                            <span className="font-medium text-slate-700">
                              Applied for: <strong>{intern.title}</strong>
                            </span>
                          )}
                          {app.applied_at && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(app.applied_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {app.notes && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded px-2 py-1 mt-1.5 max-w-xl">
                            {app.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate('candidate-discovery')}
                        className="text-xs"
                      >
                        <Users className="w-3.5 h-3.5 mr-1" />
                        Evaluate Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
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
