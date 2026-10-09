import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { db } from '../../lib/db';
import { Profile } from '../../types/database';
import { rankCandidatesForInternship } from '../../engine/matching';
import { CandidateRankingCard } from './CandidateRankingCard';
import { Card } from '../common/Card';
import { Select } from '../common/Input';
import { Badge } from '../common/Badge';
import { Users, Sparkles, Building } from 'lucide-react';

export const CandidateDiscovery: React.FC = () => {
  const { currentProfile, isDemoMode } = useAuth();
  const { internships } = useTalentGraph();

  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);

  // Load all student candidates
  useEffect(() => {
    async function loadCandidates() {
      const all = await db.getProfiles();
      setCandidates(all.filter((p) => p.role === 'student'));
    }
    loadCandidates();
  }, []);

  // Filter recruiter's own internships or default to first in demo mode
  const recruiterInternships = useMemo(() => {
    if (!currentProfile) return [];
    const own = internships.filter((i) => i.recruiter_id === currentProfile.id);
    if (own.length > 0) return own;
    return isDemoMode ? internships : [];
  }, [internships, currentProfile, isDemoMode]);

  useEffect(() => {
    if (recruiterInternships.length > 0 && !selectedInternshipId) {
      setSelectedInternshipId(recruiterInternships[0].id);
    }
  }, [recruiterInternships, selectedInternshipId]);

  const activeInternship = useMemo(() => {
    return recruiterInternships.find((i) => i.id === selectedInternshipId) || recruiterInternships[0] || null;
  }, [recruiterInternships, selectedInternshipId]);

  // Rank candidates
  const rankedCandidates = useMemo(() => {
    if (!activeInternship) return [];
    return rankCandidatesForInternship(activeInternship, candidates);
  }, [activeInternship, candidates]);

  // Apply filters
  const filteredCandidates = useMemo(() => {
    return rankedCandidates.filter(({ match }) => {
      if (eligibleOnly && match.eligibilityStatus === 'ineligible') {
        return false;
      }
      if (match.overallScore < minScore) {
        return false;
      }
      return true;
    });
  }, [rankedCandidates, eligibleOnly, minScore]);

  if (recruiterInternships.length === 0) {
    return (
      <Card className="text-center py-12 border-dashed border-2 border-slate-200">
        <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700">No internship listings created yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Post an internship listing first to discover ranked student talent.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Candidate Discovery &amp; Ranking
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Evidence-ranked candidates evaluated against your required skills, degree rules, and work mode.
        </p>
      </div>

      {/* Select Internship Listing & Filters */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <Select
              label="Select Internship Listing to Evaluate Against"
              value={selectedInternshipId}
              onChange={(e) => setSelectedInternshipId(e.target.value)}
              options={recruiterInternships.map((i) => ({
                value: i.id,
                label: `${i.title} (${i.organization})`,
              }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 self-start md:self-end">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => setEligibleOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#4285F4] focus:ring-[#4285F4] w-4 h-4"
              />
              <span>Eligible Candidates Only</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Min Score:</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-800 text-xs"
              >
                <option value={0}>All Scores</option>
                <option value={50}>50%+ Fit</option>
                <option value={70}>70%+ Strong Fit</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Listing Requirements Summary */}
      {activeInternship && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700">Required Skills:</span>
            {activeInternship.required_skills.map((s) => (
              <Badge key={s.id} variant="blue" size="sm">
                {s.name}
              </Badge>
            ))}
          </div>

          <div className="text-slate-500">
            Eligibility: {activeInternship.eligible_degrees.join(', ') || 'Any Degree'} • Min Year {activeInternship.eligible_min_year}+
          </div>
        </div>
      )}

      {/* Ranked Candidate Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Ranked {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? '' : 's'} for{' '}
            <strong>{activeInternship?.title}</strong>
          </span>
          <span className="font-semibold text-[#188038] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> High Confidence Engine
          </span>
        </div>

        {filteredCandidates.length > 0 ? (
          filteredCandidates.map(({ candidate, match }) => (
            <CandidateRankingCard
              key={candidate.id}
              candidate={candidate}
              internship={activeInternship!}
              match={match}
            />
          ))
        ) : (
          <Card className="text-center py-12 border-dashed border-2 border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No candidates match current criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try unchecking "Eligible Candidates Only" or lowering the minimum score threshold.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
