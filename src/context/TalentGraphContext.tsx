import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Internship, Skill, Application, RecruiterShortlist, ApplicationStatus } from '../types/database';
import { MatchExplanation } from '../types/matching';
import { calculateMatch } from '../engine/matching';
import { db } from '../lib/db';
import { useAuth } from './AuthContext';

interface TalentGraphContextType {
  internships: Internship[];
  skills: Skill[];
  savedInternshipIds: string[];
  applications: Application[];
  recruiterApplications: Application[];
  shortlists: RecruiterShortlist[];
  matchMap: Record<string, MatchExplanation>;
  loading: boolean;
  refreshData: () => Promise<void>;
  toggleSaveInternship: (internshipId: string) => Promise<boolean>;
  updateApplicationStatus: (internshipId: string, status: ApplicationStatus, notes?: string) => Promise<Application>;
  createInternship: (internship: Omit<Internship, 'id' | 'created_at' | 'updated_at'>) => Promise<Internship>;
  updateInternship: (internship: Internship) => Promise<Internship>;
  toggleShortlistCandidate: (internshipId: string, studentId: string, notes?: string) => Promise<boolean>;
}

const TalentGraphContext = createContext<TalentGraphContextType | undefined>(undefined);

export const TalentGraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentProfile, isDemoMode } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [savedInternshipIds, setSavedInternshipIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recruiterApplications, setRecruiterApplications] = useState<Application[]>([]);
  const [shortlists, setShortlists] = useState<RecruiterShortlist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    try {
      const [fetchedInternships, fetchedSkills] = await Promise.all([
        db.getInternships(),
        db.getSkills(),
      ]);
      setInternships(fetchedInternships);
      setSkills(fetchedSkills);

      if (currentProfile) {
        if (currentProfile.role === 'student') {
          const [saved, apps] = await Promise.all([
            db.getSavedInternships(currentProfile.id),
            db.getApplications(currentProfile.id),
          ]);
          setSavedInternshipIds(saved);
          setApplications(apps);
        } else if (currentProfile.role === 'recruiter') {
          const effectiveRecruiterId = isDemoMode && currentProfile.id !== 'rec-marcus-1'
            ? 'rec-marcus-1'
            : currentProfile.id;
          const [shorts, recApps] = await Promise.all([
            db.getRecruiterShortlists(effectiveRecruiterId),
            db.getRecruiterApplications(effectiveRecruiterId),
          ]);
          setShortlists(shorts);
          setRecruiterApplications(recApps);
        }
      }
    } catch (err) {
      console.error('Failed to load TalentGraph data', err);
    } finally {
      setLoading(false);
    }
  }, [currentProfile]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Compute deterministic match explanations for student against all internships
  const matchMap = useMemo(() => {
    const map: Record<string, MatchExplanation> = {};
    if (!currentProfile || currentProfile.role !== 'student') return map;

    for (const internship of internships) {
      map[internship.id] = calculateMatch(currentProfile, internship);
    }
    return map;
  }, [currentProfile, internships]);

  const toggleSaveInternship = async (internshipId: string): Promise<boolean> => {
    if (!currentProfile) return false;
    const isSaved = await db.toggleSaveInternship(currentProfile.id, internshipId);
    if (isSaved) {
      setSavedInternshipIds((prev) => [...prev, internshipId]);
    } else {
      setSavedInternshipIds((prev) => prev.filter((id) => id !== internshipId));
    }
    return isSaved;
  };

  const updateApplicationStatus = async (
    internshipId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<Application> => {
    if (!currentProfile) throw new Error('Must be authenticated');
    const updated = await db.updateApplicationStatus(currentProfile.id, internshipId, status, notes);
    setApplications((prev) => {
      const idx = prev.findIndex((a) => a.internship_id === internshipId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    try {
      const effectiveRecruiterId = isDemoMode ? 'rec-marcus-1' : currentProfile.id;
      const recApps = await db.getRecruiterApplications(effectiveRecruiterId);
      setRecruiterApplications(recApps);
    } catch (e) {
      console.warn('Could not refresh recruiter applications immediately', e);
    }

    return updated;
  };

  const createInternship = async (
    internship: Omit<Internship, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Internship> => {
    const created = await db.createInternship(internship);
    setInternships((prev) => [created, ...prev]);
    return created;
  };

  const updateInternship = async (internship: Internship): Promise<Internship> => {
    const updated = await db.updateInternship(internship);
    setInternships((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    return updated;
  };

  const toggleShortlistCandidate = async (
    internshipId: string,
    studentId: string,
    notes?: string
  ): Promise<boolean> => {
    if (!currentProfile) return false;
    const isShortlisted = await db.toggleShortlist(currentProfile.id, internshipId, studentId, notes);
    const updatedShorts = await db.getRecruiterShortlists(currentProfile.id);
    setShortlists(updatedShorts);
    return isShortlisted;
  };

  return (
    <TalentGraphContext.Provider
      value={{
        internships,
        skills,
        savedInternshipIds,
        applications,
        recruiterApplications,
        shortlists,
        matchMap,
        loading,
        refreshData: loadAllData,
        toggleSaveInternship,
        updateApplicationStatus,
        createInternship,
        updateInternship,
        toggleShortlistCandidate,
      }}
    >
      {children}
    </TalentGraphContext.Provider>
  );
};

export function useTalentGraph() {
  const context = useContext(TalentGraphContext);
  if (!context) {
    throw new Error('useTalentGraph must be used within a TalentGraphProvider');
  }
  return context;
}
