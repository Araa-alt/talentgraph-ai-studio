import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Select } from '../common/Input';
import { MatchExplanationModal } from '../matching/MatchExplanationModal';
import { calculateMatch } from '../../engine/matching';
import {
  BookmarkCheck,
  GraduationCap,
  Sparkles,
  Trash2,
  Mail,
} from 'lucide-react';
import { Internship, Profile } from '../../types/database';

export const ShortlistManager: React.FC = () => {
  const { currentProfile, isDemoMode } = useAuth();
  const { shortlists, internships, toggleShortlistCandidate } = useTalentGraph();

  const [filterInternshipId, setFilterInternshipId] = useState('all');
  const [selectedExplain, setSelectedExplain] = useState<{
    internship: Internship;
    candidate: Profile;
  } | null>(null);

  const recruiterInternships = useMemo(() => {
    if (!currentProfile) return internships;
    return internships.filter((i) =>
      i.recruiter_id === currentProfile.id || (isDemoMode && i.recruiter_id === 'rec-marcus-1')
    );
  }, [internships, currentProfile, isDemoMode]);

  const filteredShortlists = useMemo(() => {
    return shortlists.filter((s) => {
      if (filterInternshipId !== 'all' && s.internship_id !== filterInternshipId) {
        return false;
      }
      return true;
    });
  }, [shortlists, filterInternshipId]);

  const isPendingApproval = !isDemoMode && currentProfile?.role === 'recruiter' && currentProfile?.is_approved === false;

  if (isPendingApproval) {
    return (
      <Card className="text-center py-12 border-slate-200 bg-amber-50/50">
        <BookmarkCheck className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Recruiter Verification Pending</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
          Shortlisting and candidate management are restricted to approved recruiters. Your account is currently awaiting administrator review.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Shortlisted Candidates ({shortlists.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Private shortlist of vetted student talent with recruiter notes and match breakdowns.
          </p>
        </div>

        {recruiterInternships.length > 0 && (
          <div className="w-64">
            <Select
              value={filterInternshipId}
              onChange={(e) => setFilterInternshipId(e.target.value)}
              options={[
                { value: 'all', label: 'All Internship Roles' },
                ...recruiterInternships.map((i) => ({ value: i.id, label: i.title })),
              ]}
            />
          </div>
        )}
      </div>

      {filteredShortlists.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2 border-slate-200">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No candidates shortlisted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Explore the Candidate Discovery tab and click "Shortlist" to keep track of standout applicants.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredShortlists.map((short) => {
            const student = short.student;
            const internship = internships.find((i) => i.id === short.internship_id);
            if (!student || !internship) return null;

            const match = calculateMatch(student, internship);

            return (
              <Card key={short.id} className="p-5 border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#4285F4] text-white flex items-center justify-center font-bold text-lg shrink-0">
                      {student.full_name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{student.full_name}</h3>
                        <Badge variant="blue" size="sm">
                          For: {internship.title}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          {student.degree} • Class of {student.graduation_year}
                        </span>
                        <span>{student.institution}</span>
                      </div>

                      {short.notes && (
                        <div className="mt-2 text-xs p-2 rounded bg-slate-50 border border-slate-100 text-slate-700">
                          <strong>Recruiter Note:</strong> {short.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end lg:self-center">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#E8F0FE] text-[#1967D2]">
                      ⚡ {match.overallScore}% Fit
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedExplain({ internship, candidate: student })}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      View Match
                    </Button>

                    <a
                      href={`mailto:${student.email}?subject=Interview Invitation for ${internship.title} at ${internship.organization}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#34A853] hover:bg-[#2D9249] text-white font-medium transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Contact
                    </a>

                    <button
                      onClick={() => toggleShortlistCandidate(internship.id, student.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-50"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedExplain && (
        <MatchExplanationModal
          isOpen={!!selectedExplain}
          onClose={() => setSelectedExplain(null)}
          internship={selectedExplain.internship}
          candidate={selectedExplain.candidate}
          match={calculateMatch(selectedExplain.candidate, selectedExplain.internship)}
        />
      )}
    </div>
  );
};
