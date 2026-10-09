import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { ApplicationStatus, Internship } from '../../types/database';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { InternshipDetailsModal } from './InternshipDetailsModal';
import {
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Clock,
  Briefcase,
  Trash2,
  Calendar,
} from 'lucide-react';

export const ApplicationTracker: React.FC = () => {
  const { currentProfile } = useAuth();
  const {
    applications,
    internships,
    savedInternshipIds,
    toggleSaveInternship,
    updateApplicationStatus,
    matchMap,
  } = useTalentGraph();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  if (!currentProfile) return null;

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'saved') {
      return savedInternshipIds.includes(app.internship_id);
    }
    return app.status === activeTab;
  });

  // Also include saved internships that don't have an application record yet if on "saved" or "all"
  const savedOpportunities = savedInternshipIds
    .map((id) => internships.find((i) => i.id === id))
    .filter(Boolean) as Internship[];

  const tabs = [
    { id: 'all', label: 'All Tracked', count: applications.length },
    { id: 'saved', label: 'Saved Bookmarks', count: savedInternshipIds.length },
    {
      id: 'interested',
      label: 'Interested',
      count: applications.filter((a) => a.status === 'interested').length,
    },
    {
      id: 'applied',
      label: 'Applied',
      count: applications.filter((a) => a.status === 'applied').length,
    },
    {
      id: 'interview',
      label: 'Interviewing',
      count: applications.filter((a) => a.status === 'interview').length,
    },
    {
      id: 'offer',
      label: 'Offers',
      count: applications.filter((a) => a.status === 'offer').length,
    },
  ];

  const handleStatusChange = async (internshipId: string, status: ApplicationStatus) => {
    await updateApplicationStatus(internshipId, status);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Application Progress Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Monitor your internship pipeline from initial interest to offers.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'saved' ? (
        // Saved bookmarks list
        savedOpportunities.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-slate-200">
            <BookmarkCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No saved bookmarks yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Browse the Find Internships tab and click the bookmark icon on any role to save it here.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedOpportunities.map((internship) => {
              const match = matchMap[internship.id];
              return (
                <Card key={internship.id} className="border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {internship.organization}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{internship.title}</h4>
                      </div>
                      <button
                        onClick={() => toggleSaveInternship(internship.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {internship.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {internship.duration}
                      </span>
                    </div>

                    {match && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#E8F0FE] text-[#1967D2] mb-3">
                        ⚡ {match.overallScore}% Fit ({match.recommendationTier})
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInternship(internship)}
                    >
                      View Details
                    </Button>
                    <a
                      href={internship.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#1A73E8] hover:underline flex items-center gap-1 font-semibold"
                    >
                      Apply Externally <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : filteredApps.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No applications in this stage</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Click on any internship and select a status like "Applied" to track it here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const intern = app.internship;
            if (!intern) return null;
            return (
              <Card key={app.id} className="p-4 border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {intern.organization}
                      </span>
                      <Badge
                        variant={
                          app.status === 'offer'
                            ? 'green'
                            : app.status === 'interview'
                            ? 'blue'
                            : app.status === 'rejected'
                            ? 'red'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">{intern.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>{intern.location}</span>
                      {app.applied_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    {(['interested', 'applied', 'interview', 'offer', 'rejected'] as ApplicationStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(intern.id, st)}
                          className={`px-2.5 py-1 rounded text-xs capitalize font-medium transition-colors ${
                            app.status === st
                              ? 'bg-[#4285F4] text-white font-semibold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInternship(intern)}
                      className="ml-2"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedInternship && (
        <InternshipDetailsModal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          internship={selectedInternship}
          match={matchMap[selectedInternship.id]}
        />
      )}
    </div>
  );
};
