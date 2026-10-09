import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTalentGraph } from '../../context/TalentGraphContext';
import { rankInternshipsForStudent } from '../../engine/matching';
import { InternshipCard } from './InternshipCard';
import { InternshipDetailsModal } from './InternshipDetailsModal';
import { Internship } from '../../types/database';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  BookmarkCheck,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

export interface StudentDashboardProps {
  onNavigate: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentProfile } = useAuth();
  const { internships, savedInternshipIds, applications } = useTalentGraph();
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  // Compute profile completeness score (0 - 100)
  const profileCompletion = useMemo(() => {
    if (!currentProfile) return 0;
    let score = 0;
    if (currentProfile.full_name) score += 15;
    if (currentProfile.degree && currentProfile.graduation_year) score += 20;
    if (currentProfile.institution) score += 10;
    if ((currentProfile.skills || []).length >= 3) score += 20;
    if ((currentProfile.projects || []).length >= 1) score += 20;
    if ((currentProfile.hackathons || []).length >= 1) score += 15;
    return Math.min(100, score);
  }, [currentProfile]);

  // Ranked recommendations
  const rankedInternships = useMemo(() => {
    if (!currentProfile) return [];
    return rankInternshipsForStudent(currentProfile, internships);
  }, [currentProfile, internships]);

  // Aggregate student skill strengths and frequent gaps across opportunities
  const { topSkills, commonGaps } = useMemo(() => {
    const studentSkills = new Set(
      (currentProfile?.skills || []).map((s) => s.skill.normalized_name)
    );
    const gapsCount: Record<string, number> = {};

    internships.forEach((intern) => {
      intern.required_skills.forEach((rs) => {
        if (!studentSkills.has(rs.normalized_name)) {
          gapsCount[rs.name] = (gapsCount[rs.name] || 0) + 1;
        }
      });
    });

    const sortedGaps = Object.entries(gapsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);

    return {
      topSkills: (currentProfile?.skills || []).slice(0, 5),
      commonGaps: sortedGaps,
    };
  }, [currentProfile, internships]);

  if (!currentProfile) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome & Quick Stats */}
      <div className="bg-gradient-to-r from-white via-white to-[#E8F0FE]/40 rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F0FE] text-[#1967D2] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Explainable Internship Matching
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {currentProfile.full_name}!
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              {currentProfile.degree ? `${currentProfile.degree} student at ${currentProfile.institution || 'University'}` : 'Undergraduate Student'} • Class of {currentProfile.graduation_year || 'TBD'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('my-profile')}
              icon={<Layers className="w-4 h-4" />}
            >
              Manage Evidence
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('find-internships')}
              icon={<Search className="w-4 h-4" />}
            >
              Explore Listings
            </Button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34A853]" /> Profile &amp; Evidence Completion
            </span>
            <span className="font-bold text-[#4285F4]">{profileCompletion}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#4285F4] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          {profileCompletion < 100 && (
            <p className="text-xs text-slate-500 mt-2">
              Tip: Add verified projects or hackathon achievements to unlock higher match confidence!
            </p>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3.5 p-4 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{internships.length}</div>
            <div className="text-xs text-slate-500 font-medium">Available Roles</div>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#188038] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {rankedInternships.filter((r) => r.match.overallScore >= 70).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Strong Fit Matches</div>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-[#FEF7E0] text-[#B06000] flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{savedInternshipIds.length}</div>
            <div className="text-xs text-slate-500 font-medium">Saved Bookmarks</div>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{applications.length}</div>
            <div className="text-xs text-slate-500 font-medium">Tracked Applications</div>
          </div>
        </Card>
      </div>

      {/* Top Ranked Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Top Internship Matches
            </h2>
            <p className="text-xs text-slate-500">
              Ranked deterministically by skill alignment, project evidence, and eligibility.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('find-internships')}
            className="text-[#4285F4] hover:text-[#3367D6]"
          >
            View All ({internships.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rankedInternships.slice(0, 3).map(({ internship, match }) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              match={match}
              onSelect={(int) => setSelectedInternship(int)}
            />
          ))}
        </div>
      </div>

      {/* Two Column: Skill Evidence vs Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Verified Portfolio Evidence */}
        <Card className="border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#4285F4]" /> My Demonstrated Capabilities
            </h3>
            <span className="text-xs text-slate-500">
              {(currentProfile.skills || []).length} Declared Skills
            </span>
          </div>

          <div className="space-y-3">
            {topSkills.map((ps) => (
              <div
                key={ps.skill_id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900">{ps.skill.name}</span>
                  <span className="text-[11px] text-slate-400 capitalize ml-2">
                    ({ps.proficiency_level})
                  </span>
                </div>
                <Badge
                  variant={
                    ps.evidence_type === 'project_backed'
                      ? 'blue'
                      : ps.evidence_type === 'hackathon_backed'
                      ? 'green'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {ps.evidence_type === 'project_backed'
                    ? '📁 Project-Backed'
                    : ps.evidence_type === 'hackathon_backed'
                    ? '🏆 Hackathon-Backed'
                    : 'Self-Declared'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Skill Gaps to Bridge */}
        <Card className="border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#FBBC05]" /> Frequent Market Skill Gaps
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('growth')}
              className="text-xs text-[#4285F4]"
            >
              Growth Projects →
            </Button>
          </div>

          <p className="text-xs text-slate-600 mb-3">
            These technical skills appear in active listings but are not yet documented in your profile:
          </p>

          <div className="flex flex-wrap gap-2">
            {commonGaps.map((skillName, i) => (
              <Badge key={i} variant="yellow" size="md">
                + {skillName}
              </Badge>
            ))}
          </div>

          <div className="mt-6 p-3 rounded-lg bg-[#E8F0FE]/60 border border-[#D2E3FC] text-xs text-slate-700 leading-relaxed">
            💡 Build a project using one of these skills to automatically elevate your match ranking!
          </div>
        </Card>
      </div>

      {selectedInternship && (
        <InternshipDetailsModal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          internship={selectedInternship}
          match={
            rankedInternships.find((r) => r.internship.id === selectedInternship.id)?.match
          }
        />
      )}
    </div>
  );
};
