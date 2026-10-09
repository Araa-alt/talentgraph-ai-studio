import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { rankInternshipsForStudent } from '../../engine/matching';
import { InternshipCard } from './InternshipCard';
import { InternshipDetailsModal } from './InternshipDetailsModal';
import { Internship } from '../../types/database';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

export const FindInternships: React.FC = () => {
  const { currentProfile } = useAuth();
  const { internships } = useTalentGraph();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'fit' | 'recent' | 'organization'>('fit');
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  // Rank with explainable matching
  const rankedAll = useMemo(() => {
    if (!currentProfile) {
      return internships.map((internship) => ({ internship, match: undefined }));
    }
    return rankInternshipsForStudent(currentProfile, internships);
  }, [currentProfile, internships]);

  // Apply search and filter criteria
  const filteredList = useMemo(() => {
    return rankedAll.filter(({ internship, match }) => {
      // 1. Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = internship.title.toLowerCase().includes(q);
        const matchesOrg = internship.organization.toLowerCase().includes(q);
        const matchesLocation = internship.location.toLowerCase().includes(q);
        const matchesSkill = internship.required_skills.some((s) =>
          s.name.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesOrg && !matchesLocation && !matchesSkill) {
          return false;
        }
      }

      // 2. Work Mode filter
      if (selectedWorkMode !== 'all' && internship.work_mode !== selectedWorkMode) {
        return false;
      }

      // 3. Eligible Only filter
      if (eligibleOnly && match && match.eligibilityStatus === 'ineligible') {
        return false;
      }

      return true;
    });
  }, [rankedAll, searchQuery, selectedWorkMode, eligibleOnly]);

  // Apply sorting
  const sortedList = useMemo(() => {
    const copy = [...filteredList];
    if (sortBy === 'fit') {
      // already sorted by match fit
      return copy;
    }
    if (sortBy === 'recent') {
      return copy.sort(
        (a, b) => new Date(b.internship.created_at).getTime() - new Date(a.internship.created_at).getTime()
      );
    }
    if (sortBy === 'organization') {
      return copy.sort((a, b) => a.internship.organization.localeCompare(b.internship.organization));
    }
    return copy;
  }, [filteredList, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedWorkMode('all');
    setEligibleOnly(false);
    setSortBy('fit');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Discover Internships
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse verified opportunities ranked by your skills, demonstrated projects, and eligibility.
          </p>
        </div>

        <div className="w-full md:w-80">
          <Input
            placeholder="Search roles, companies, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Work Mode:
            </span>
            {['all', 'remote', 'hybrid', 'onsite'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedWorkMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                  selectedWorkMode === mode
                    ? 'bg-[#4285F4] text-white border-[#4285F4] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}

            <div className="h-5 w-px bg-slate-200 mx-2 hidden sm:block" />

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => setEligibleOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#4285F4] focus:ring-[#4285F4] w-4 h-4"
              />
              <span>Eligible Roles Only</span>
            </label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
            >
              <option value="fit">Best Fit (Match Score)</option>
              <option value="recent">Most Recent</option>
              <option value="organization">Company Name</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {sortedList.length} internship opportunities</span>
        {(selectedWorkMode !== 'all' || eligibleOnly || searchQuery) && (
          <button onClick={resetFilters} className="text-[#4285F4] hover:underline font-semibold">
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid of Results */}
      {sortedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedList.map(({ internship, match }) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              match={match}
              onSelect={(int) => setSelectedInternship(int)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No matching internships found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Try adjusting your search query, switching work mode filters, or unchecking "Eligible Roles Only".
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      )}

      {selectedInternship && (
        <InternshipDetailsModal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          internship={selectedInternship}
          match={
            sortedList.find((item) => item.internship.id === selectedInternship.id)?.match
          }
        />
      )}
    </div>
  );
};
