import { isSupabaseConfigured, supabase } from './supabase';
import {
  INITIAL_PROFILES,
  INITIAL_INTERNSHIPS,
  INITIAL_SKILLS,
  INITIAL_SAVED_INTERNSHIPS,
  INITIAL_APPLICATIONS,
  INITIAL_SHORTLISTS,
} from './mockData';
import {
  Profile,
  Internship,
  SavedInternship,
  Skill,
  Project,
  HackathonExperience,
  Application,
  RecruiterShortlist,
  ProfileSkill,
  ApplicationStatus,
} from '../types/database';

export const isDemoMode = !isSupabaseConfigured;

// Local storage keys
const STORAGE_PREFIX = 'talentgraph_v1_';
const KEYS = {
  PROFILES: `${STORAGE_PREFIX}profiles`,
  INTERNSHIPS: `${STORAGE_PREFIX}internships`,
  SKILLS: `${STORAGE_PREFIX}skills`,
  SAVED: `${STORAGE_PREFIX}saved`,
  APPLICATIONS: `${STORAGE_PREFIX}applications`,
  SHORTLISTS: `${STORAGE_PREFIX}shortlists`,
};

// Safe local storage helpers
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage quota exceeded or unavailable', err);
  }
}

// Initialize seed data in local store if not present
function initializeLocalStore() {
  if (!localStorage.getItem(KEYS.PROFILES)) {
    setLocalItem(KEYS.PROFILES, INITIAL_PROFILES);
  }
  if (!localStorage.getItem(KEYS.INTERNSHIPS)) {
    setLocalItem(KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
  }
  if (!localStorage.getItem(KEYS.SKILLS)) {
    setLocalItem(KEYS.SKILLS, INITIAL_SKILLS);
  }
  if (!localStorage.getItem(KEYS.SAVED)) {
    setLocalItem(KEYS.SAVED, INITIAL_SAVED_INTERNSHIPS);
  }
  if (!localStorage.getItem(KEYS.APPLICATIONS)) {
    setLocalItem(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }
  if (!localStorage.getItem(KEYS.SHORTLISTS)) {
    setLocalItem(KEYS.SHORTLISTS, INITIAL_SHORTLISTS);
  }
}

// Trigger initial setup
if (typeof window !== 'undefined') {
  initializeLocalStore();
}

/**
 * Data Repository Layer
 * Seamlessly interfaces with Supabase when configured, with robust in-memory/localStorage fallback.
 */
export const db = {
  isDemoMode,

  // --- Skills ---
  async getSkills(): Promise<Skill[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('skills').select('*').order('name');
        if (!error && data && data.length > 0) {
          return data as Skill[];
        }
      } catch (err) {
        console.warn('Supabase getSkills failed, using fallback', err);
      }
    }
    return getLocalItem<Skill[]>(KEYS.SKILLS, INITIAL_SKILLS);
  },

  // --- Profiles ---
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Requirement 9: Privacy-preserving student discovery query (omitting private email and resume_url)
        const { data: profileRows, error } = await supabase
          .from('profiles')
          .select('id, role, is_approved, full_name, avatar_url, institution, degree, field_of_study, current_year, graduation_year, bio, preferred_roles, preferred_locations, preferred_work_modes, github_url, portfolio_url, created_at, updated_at')
          .eq('role', 'student');

        if (!error && profileRows && profileRows.length > 0) {
          const profileIds = profileRows.map((p) => p.id);

          // Fetch associated skills, projects, and hackathons
          const [skillsRes, projectsRes, hackathonsRes] = await Promise.all([
            supabase
              .from('profile_skills')
              .select('id, profile_id, skill_id, proficiency_level, evidence_type, skill:skills(*)')
              .in('profile_id', profileIds),
            supabase
              .from('projects')
              .select('*, project_skills(skill:skills(*))')
              .in('profile_id', profileIds),
            supabase
              .from('hackathon_experiences')
              .select('*, hackathon_skills(skill:skills(*))')
              .in('profile_id', profileIds),
          ]);

          const skillsByProfile: Record<string, ProfileSkill[]> = {};
          (skillsRes.data || []).forEach((row: any) => {
            if (!skillsByProfile[row.profile_id]) skillsByProfile[row.profile_id] = [];
            skillsByProfile[row.profile_id].push({
              id: row.id,
              profile_id: row.profile_id,
              skill_id: row.skill_id,
              skill: row.skill,
              proficiency_level: row.proficiency_level,
              evidence_type: row.evidence_type,
            });
          });

          const projectsByProfile: Record<string, Project[]> = {};
          (projectsRes.data || []).forEach((row: any) => {
            if (!projectsByProfile[row.profile_id]) projectsByProfile[row.profile_id] = [];
            const linkedSkills = (row.project_skills || []).map((ps: any) => ps.skill).filter(Boolean);
            projectsByProfile[row.profile_id].push({
              id: row.id,
              profile_id: row.profile_id,
              title: row.title,
              description: row.description,
              repo_url: row.repo_url,
              live_url: row.live_url,
              role: row.role,
              contribution: row.contribution,
              outcomes: row.outcomes,
              skills: linkedSkills,
              created_at: row.created_at,
              updated_at: row.updated_at,
            });
          });

          const hackathonsByProfile: Record<string, HackathonExperience[]> = {};
          (hackathonsRes.data || []).forEach((row: any) => {
            if (!hackathonsByProfile[row.profile_id]) hackathonsByProfile[row.profile_id] = [];
            const linkedSkills = (row.hackathon_skills || []).map((hs: any) => hs.skill).filter(Boolean);
            hackathonsByProfile[row.profile_id].push({
              id: row.id,
              profile_id: row.profile_id,
              event_name: row.event_name,
              project_name: row.project_name,
              role: row.role,
              contribution: row.contribution,
              achievement: row.achievement,
              repo_url: row.repo_url,
              event_date: row.event_date,
              skills: linkedSkills,
              created_at: row.created_at,
              updated_at: row.updated_at,
            });
          });

          return profileRows.map((p: any) => ({
            ...p,
            email: '', // Deliberately blank in public candidate discovery view
            skills: skillsByProfile[p.id] || [],
            projects: projectsByProfile[p.id] || [],
            hackathons: hackathonsByProfile[p.id] || [],
          })) as Profile[];
        }
      } catch (err) {
        console.warn('Supabase getProfiles failed, using fallback', err);
      }
    }
    return getLocalItem<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
  },

  async getProfile(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profileRow, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && profileRow) {
          const [skillsRes, projectsRes, hackathonsRes] = await Promise.all([
            supabase
              .from('profile_skills')
              .select('id, profile_id, skill_id, proficiency_level, evidence_type, skill:skills(*)')
              .eq('profile_id', id),
            supabase
              .from('projects')
              .select('*, project_skills(skill:skills(*))')
              .eq('profile_id', id)
              .order('created_at', { ascending: false }),
            supabase
              .from('hackathon_experiences')
              .select('*, hackathon_skills(skill:skills(*))')
              .eq('profile_id', id)
              .order('created_at', { ascending: false }),
          ]);

          const profileSkills: ProfileSkill[] = (skillsRes.data || []).map((row: any) => ({
            id: row.id,
            profile_id: row.profile_id,
            skill_id: row.skill_id,
            skill: row.skill,
            proficiency_level: row.proficiency_level,
            evidence_type: row.evidence_type,
          }));

          const projects: Project[] = (projectsRes.data || []).map((row: any) => ({
            id: row.id,
            profile_id: row.profile_id,
            title: row.title,
            description: row.description,
            repo_url: row.repo_url,
            live_url: row.live_url,
            role: row.role,
            contribution: row.contribution,
            outcomes: row.outcomes,
            skills: (row.project_skills || []).map((ps: any) => ps.skill).filter(Boolean),
            created_at: row.created_at,
            updated_at: row.updated_at,
          }));

          const hackathons: HackathonExperience[] = (hackathonsRes.data || []).map((row: any) => ({
            id: row.id,
            profile_id: row.profile_id,
            event_name: row.event_name,
            project_name: row.project_name,
            role: row.role,
            contribution: row.contribution,
            achievement: row.achievement,
            repo_url: row.repo_url,
            event_date: row.event_date,
            skills: (row.hackathon_skills || []).map((hs: any) => hs.skill).filter(Boolean),
            created_at: row.created_at,
            updated_at: row.updated_at,
          }));

          return {
            ...profileRow,
            skills: profileSkills,
            projects,
            hackathons,
          } as Profile;
        }
      } catch (err) {
        console.warn('Supabase getProfile failed, checking local storage', err);
      }
    }
    const profiles = getLocalItem<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.find((p) => p.id === id) || null;
  },

  // Requirement 2: Link newly authenticated profile directly to auth.users.id
  async createProfile(profile: Profile): Promise<Profile> {
    const isApproved = profile.role === 'recruiter' ? Boolean(profile.is_approved) : true;
    const newRecord: Profile = {
      ...profile,
      is_approved: isApproved,
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      skills: profile.skills || [],
      projects: profile.projects || [],
      hackathons: profile.hackathons || [],
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('profiles').insert({
          id: profile.id, // Strictly links to auth.users.id
          email: profile.email,
          role: profile.role,
          is_approved: isApproved,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          institution: profile.institution,
          degree: profile.degree,
          field_of_study: profile.field_of_study,
          current_year: profile.current_year,
          graduation_year: profile.graduation_year,
          bio: profile.bio,
          preferred_roles: profile.preferred_roles || [],
          preferred_locations: profile.preferred_locations || [],
          preferred_work_modes: profile.preferred_work_modes || ['remote', 'hybrid', 'onsite'],
          github_url: profile.github_url,
          portfolio_url: profile.portfolio_url,
          resume_url: profile.resume_url,
        });
        if (error) {
          console.error('Failed to create profile in Supabase', error);
        }
      } catch (err) {
        console.error('Error creating profile in Supabase', err);
      }
    }

    const profiles = getLocalItem<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    const existingIndex = profiles.findIndex((p) => p.id === profile.id);
    if (existingIndex >= 0) {
      profiles[existingIndex] = newRecord;
    } else {
      profiles.push(newRecord);
    }
    setLocalItem(KEYS.PROFILES, profiles);
    return newRecord;
  },

  async updateProfile(profile: Profile): Promise<Profile> {
    const updated = { ...profile, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            institution: profile.institution,
            degree: profile.degree,
            field_of_study: profile.field_of_study,
            current_year: profile.current_year,
            graduation_year: profile.graduation_year,
            bio: profile.bio,
            preferred_roles: profile.preferred_roles,
            preferred_locations: profile.preferred_locations,
            preferred_work_modes: profile.preferred_work_modes,
            github_url: profile.github_url,
            portfolio_url: profile.portfolio_url,
            resume_url: profile.resume_url,
            updated_at: updated.updated_at,
          })
          .eq('id', profile.id);
      } catch (err) {
        console.error('Supabase updateProfile error', err);
      }
    }
    const profiles = getLocalItem<Profile[]>(KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = updated;
    } else {
      profiles.push(updated);
    }
    setLocalItem(KEYS.PROFILES, profiles);
    return updated;
  },

  // --- Projects ---
  async addProject(
    profileId: string,
    proj: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project> {
    const projectId = `proj-${Date.now()}`;
    const newProj: Project = {
      ...proj,
      id: projectId,
      profile_id: profileId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('projects')
          .insert({
            profile_id: profileId,
            title: proj.title,
            description: proj.description,
            repo_url: proj.repo_url,
            live_url: proj.live_url,
            role: proj.role,
            contribution: proj.contribution,
            outcomes: proj.outcomes,
          })
          .select()
          .single();

        if (!error && inserted) {
          newProj.id = inserted.id;

          if (proj.skills && proj.skills.length > 0) {
            const skillRows = proj.skills.map((s) => ({
              project_id: inserted.id,
              skill_id: s.id,
            }));
            await supabase.from('project_skills').insert(skillRows);
          }
        }
      } catch (err) {
        console.error('Supabase addProject error', err);
      }
    }

    const profile = await this.getProfile(profileId);
    if (profile) {
      const updatedProjects = [...(profile.projects || []), newProj];
      await this.updateProfile({ ...profile, projects: updatedProjects });
    }
    return newProj;
  },

  async updateProject(project: Project): Promise<Project> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({
            title: project.title,
            description: project.description,
            repo_url: project.repo_url,
            live_url: project.live_url,
            role: project.role,
            contribution: project.contribution,
            outcomes: project.outcomes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id);

        if (project.skills) {
          await supabase.from('project_skills').delete().eq('project_id', project.id);
          const skillRows = project.skills.map((s) => ({
            project_id: project.id,
            skill_id: s.id,
          }));
          if (skillRows.length > 0) {
            await supabase.from('project_skills').insert(skillRows);
          }
        }
      } catch (err) {
        console.error('Supabase updateProject error', err);
      }
    }

    const profile = await this.getProfile(project.profile_id);
    if (profile) {
      const updatedProjects = (profile.projects || []).map((p) =>
        p.id === project.id ? { ...project, updated_at: new Date().toISOString() } : p
      );
      await this.updateProfile({ ...profile, projects: updatedProjects });
    }
    return project;
  },

  async deleteProject(profileId: string, projectId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', projectId).eq('profile_id', profileId);
      } catch (err) {
        console.error('Supabase deleteProject error', err);
      }
    }

    const profile = await this.getProfile(profileId);
    if (profile) {
      const updatedProjects = (profile.projects || []).filter((p) => p.id !== projectId);
      await this.updateProfile({ ...profile, projects: updatedProjects });
    }
  },

  // --- Hackathons ---
  async addHackathon(
    profileId: string,
    hack: Omit<HackathonExperience, 'id' | 'created_at' | 'updated_at'>
  ): Promise<HackathonExperience> {
    const hackId = `hack-${Date.now()}`;
    const newHack: HackathonExperience = {
      ...hack,
      id: hackId,
      profile_id: profileId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('hackathon_experiences')
          .insert({
            profile_id: profileId,
            event_name: hack.event_name,
            project_name: hack.project_name,
            role: hack.role,
            contribution: hack.contribution,
            achievement: hack.achievement,
            repo_url: hack.repo_url,
            event_date: hack.event_date || null,
          })
          .select()
          .single();

        if (!error && inserted) {
          newHack.id = inserted.id;

          if (hack.skills && hack.skills.length > 0) {
            const skillRows = hack.skills.map((s) => ({
              hackathon_id: inserted.id,
              skill_id: s.id,
            }));
            await supabase.from('hackathon_skills').insert(skillRows);
          }
        }
      } catch (err) {
        console.error('Supabase addHackathon error', err);
      }
    }

    const profile = await this.getProfile(profileId);
    if (profile) {
      const updatedHacks = [...(profile.hackathons || []), newHack];
      await this.updateProfile({ ...profile, hackathons: updatedHacks });
    }
    return newHack;
  },

  async updateHackathon(hackathon: HackathonExperience): Promise<HackathonExperience> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('hackathon_experiences')
          .update({
            event_name: hackathon.event_name,
            project_name: hackathon.project_name,
            role: hackathon.role,
            contribution: hackathon.contribution,
            achievement: hackathon.achievement,
            repo_url: hackathon.repo_url,
            event_date: hackathon.event_date || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', hackathon.id);

        if (hackathon.skills) {
          await supabase.from('hackathon_skills').delete().eq('hackathon_id', hackathon.id);
          const skillRows = hackathon.skills.map((s) => ({
            hackathon_id: hackathon.id,
            skill_id: s.id,
          }));
          if (skillRows.length > 0) {
            await supabase.from('hackathon_skills').insert(skillRows);
          }
        }
      } catch (err) {
        console.error('Supabase updateHackathon error', err);
      }
    }

    const profile = await this.getProfile(hackathon.profile_id);
    if (profile) {
      const updatedHacks = (profile.hackathons || []).map((h) =>
        h.id === hackathon.id ? { ...hackathon, updated_at: new Date().toISOString() } : h
      );
      await this.updateProfile({ ...profile, hackathons: updatedHacks });
    }
    return hackathon;
  },

  async deleteHackathon(profileId: string, hackathonId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('hackathon_experiences')
          .delete()
          .eq('id', hackathonId)
          .eq('profile_id', profileId);
      } catch (err) {
        console.error('Supabase deleteHackathon error', err);
      }
    }

    const profile = await this.getProfile(profileId);
    if (profile) {
      const updatedHacks = (profile.hackathons || []).filter((h) => h.id !== hackathonId);
      await this.updateProfile({ ...profile, hackathons: updatedHacks });
    }
  },

  // --- Profile Skills ---
  async saveProfileSkill(profileId: string, skillEntry: ProfileSkill): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profile_skills').upsert(
          {
            profile_id: profileId,
            skill_id: skillEntry.skill_id,
            proficiency_level: skillEntry.proficiency_level,
            evidence_type: skillEntry.evidence_type,
          },
          { onConflict: 'profile_id,skill_id' }
        );
      } catch (err) {
        console.error('Supabase saveProfileSkill error', err);
      }
    }

    const profile = await this.getProfile(profileId);
    if (profile) {
      const existing = profile.skills || [];
      const index = existing.findIndex((s) => s.skill_id === skillEntry.skill_id);
      let updatedSkills: ProfileSkill[];
      if (index >= 0) {
        updatedSkills = existing.map((s, i) => (i === index ? skillEntry : s));
      } else {
        updatedSkills = [...existing, skillEntry];
      }
      await this.updateProfile({ ...profile, skills: updatedSkills });
    }
  },

  async removeProfileSkill(profileId: string, skillId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profile_skills')
          .delete()
          .eq('profile_id', profileId)
          .eq('skill_id', skillId);
      } catch (err) {
        console.error('Supabase removeProfileSkill error', err);
      }
    }

    const profile = await this.getProfile(profileId);
    if (profile) {
      const updatedSkills = (profile.skills || []).filter((s) => s.skill_id !== skillId);
      await this.updateProfile({ ...profile, skills: updatedSkills });
    }
  },

  // --- Internships ---
  async getInternships(): Promise<Internship[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('internships')
          .select('*, required_links:internship_required_skills(skill:skills(*)), preferred_links:internship_preferred_skills(skill:skills(*))')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            recruiter_id: item.recruiter_id,
            title: item.title,
            organization: item.organization,
            description: item.description,
            responsibilities: item.responsibilities || [],
            location: item.location,
            work_mode: item.work_mode,
            duration: item.duration,
            stipend: item.stipend,
            deadline: item.deadline,
            application_url: item.application_url,
            contact_info: item.contact_info,
            status: item.status,
            eligible_degrees: item.eligible_degrees || [],
            eligible_grad_years: item.eligible_grad_years || [],
            eligible_min_year: item.eligible_min_year || 1,
            required_skills: (item.required_links || []).map((l: any) => l.skill).filter(Boolean),
            preferred_skills: (item.preferred_links || []).map((l: any) => l.skill).filter(Boolean),
            created_at: item.created_at,
            updated_at: item.updated_at,
          })) as Internship[];
        }
      } catch (err) {
        console.warn('Supabase getInternships failed, using fallback', err);
      }
    }
    return getLocalItem<Internship[]>(KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
  },

  async getInternship(id: string): Promise<Internship | null> {
    const all = await this.getInternships();
    return all.find((i) => i.id === id) || null;
  },

  async createInternship(
    internship: Omit<Internship, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Internship> {
    const newInternship: Internship = {
      ...internship,
      id: `int-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('internships')
          .insert({
            recruiter_id: internship.recruiter_id,
            title: internship.title,
            organization: internship.organization,
            description: internship.description,
            responsibilities: internship.responsibilities,
            location: internship.location,
            work_mode: internship.work_mode,
            duration: internship.duration,
            stipend: internship.stipend,
            deadline: internship.deadline,
            application_url: internship.application_url,
            contact_info: internship.contact_info,
            status: internship.status,
            eligible_degrees: internship.eligible_degrees,
            eligible_grad_years: internship.eligible_grad_years,
            eligible_min_year: internship.eligible_min_year,
          })
          .select()
          .single();

        if (!error && inserted) {
          newInternship.id = inserted.id;

          if (internship.required_skills && internship.required_skills.length > 0) {
            const reqRows = internship.required_skills.map((s) => ({
              internship_id: inserted.id,
              skill_id: s.id,
            }));
            await supabase.from('internship_required_skills').insert(reqRows);
          }

          if (internship.preferred_skills && internship.preferred_skills.length > 0) {
            const prefRows = internship.preferred_skills.map((s) => ({
              internship_id: inserted.id,
              skill_id: s.id,
            }));
            await supabase.from('internship_preferred_skills').insert(prefRows);
          }
        }
      } catch (err) {
        console.error('Supabase createInternship error', err);
      }
    }

    const list = getLocalItem<Internship[]>(KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    list.unshift(newInternship);
    setLocalItem(KEYS.INTERNSHIPS, list);
    return newInternship;
  },

  async updateInternship(internship: Internship): Promise<Internship> {
    const updated = { ...internship, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('internships')
          .update({
            title: internship.title,
            organization: internship.organization,
            description: internship.description,
            responsibilities: internship.responsibilities,
            location: internship.location,
            work_mode: internship.work_mode,
            duration: internship.duration,
            stipend: internship.stipend,
            deadline: internship.deadline,
            application_url: internship.application_url,
            contact_info: internship.contact_info,
            status: internship.status,
            eligible_degrees: internship.eligible_degrees,
            eligible_grad_years: internship.eligible_grad_years,
            eligible_min_year: internship.eligible_min_year,
            updated_at: updated.updated_at,
          })
          .eq('id', internship.id);

        if (internship.required_skills) {
          await supabase.from('internship_required_skills').delete().eq('internship_id', internship.id);
          const reqRows = internship.required_skills.map((s) => ({
            internship_id: internship.id,
            skill_id: s.id,
          }));
          if (reqRows.length > 0) {
            await supabase.from('internship_required_skills').insert(reqRows);
          }
        }

        if (internship.preferred_skills) {
          await supabase.from('internship_preferred_skills').delete().eq('internship_id', internship.id);
          const prefRows = internship.preferred_skills.map((s) => ({
            internship_id: internship.id,
            skill_id: s.id,
          }));
          if (prefRows.length > 0) {
            await supabase.from('internship_preferred_skills').insert(prefRows);
          }
        }
      } catch (err) {
        console.error('Supabase updateInternship error', err);
      }
    }

    const list = getLocalItem<Internship[]>(KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const index = list.findIndex((i) => i.id === internship.id);
    if (index >= 0) {
      list[index] = updated;
    }
    setLocalItem(KEYS.INTERNSHIPS, list);
    return updated;
  },

  // --- Saved Internships (Requirement 7: Isolated per student) ---
  async getSavedInternships(studentId: string): Promise<string[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('saved_internships')
          .select('internship_id')
          .eq('student_id', studentId);

        if (!error && data) {
          return data.map((d: any) => d.internship_id);
        }
      } catch (err) {
        console.warn('Supabase getSavedInternships error, fallback to local', err);
      }
    }
    const saved = getLocalItem<SavedInternship[]>(KEYS.SAVED, INITIAL_SAVED_INTERNSHIPS);
    return saved.filter((s) => s.student_id === studentId).map((s) => s.internship_id);
  },

  async toggleSaveInternship(studentId: string, internshipId: string): Promise<boolean> {
    const saved = getLocalItem<SavedInternship[]>(KEYS.SAVED, INITIAL_SAVED_INTERNSHIPS);
    const existingIndex = saved.findIndex(
      (s) => s.student_id === studentId && s.internship_id === internshipId
    );

    let isSaved = false;

    if (isSupabaseConfigured && supabase) {
      try {
        if (existingIndex >= 0) {
          await supabase
            .from('saved_internships')
            .delete()
            .eq('student_id', studentId)
            .eq('internship_id', internshipId);
        } else {
          await supabase
            .from('saved_internships')
            .insert({ student_id: studentId, internship_id: internshipId });
        }
      } catch (err) {
        console.error('Supabase toggleSaveInternship error', err);
      }
    }

    if (existingIndex >= 0) {
      saved.splice(existingIndex, 1);
      isSaved = false;
    } else {
      saved.push({
        id: `saved-${Date.now()}`,
        student_id: studentId,
        internship_id: internshipId,
        created_at: new Date().toISOString(),
      });
      isSaved = true;
    }
    setLocalItem(KEYS.SAVED, saved);
    return isSaved;
  },

  // --- Applications (Requirement 7: Isolated per student / recruiter access) ---
  async getApplications(studentId: string): Promise<Application[]> {
    const internships = await this.getInternships();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((a: any) => ({
            ...a,
            internship: internships.find((i) => i.id === a.internship_id),
          })) as Application[];
        }
      } catch (err) {
        console.warn('Supabase getApplications error, fallback to local', err);
      }
    }

    const apps = getLocalItem<Application[]>(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const studentApps = apps.filter((a) => a.student_id === studentId);

    return studentApps.map((a) => ({
      ...a,
      internship: internships.find((i) => i.id === a.internship_id),
    }));
  },

  async updateApplicationStatus(
    studentId: string,
    internshipId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<Application> {
    const apps = getLocalItem<Application[]>(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const existingIndex = apps.findIndex(
      (a) => a.student_id === studentId && a.internship_id === internshipId
    );

    let updatedApp: Application;
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('applications').upsert(
          {
            student_id: studentId,
            internship_id: internshipId,
            status,
            notes,
            applied_at: status === 'applied' ? now : undefined,
            updated_at: now,
          },
          { onConflict: 'student_id,internship_id' }
        );
      } catch (err) {
        console.error('Supabase updateApplicationStatus error', err);
      }
    }

    if (existingIndex >= 0) {
      updatedApp = {
        ...apps[existingIndex],
        status,
        notes: notes !== undefined ? notes : apps[existingIndex].notes,
        applied_at: status === 'applied' && !apps[existingIndex].applied_at ? now : apps[existingIndex].applied_at,
        updated_at: now,
      };
      apps[existingIndex] = updatedApp;
    } else {
      updatedApp = {
        id: `app-${Date.now()}`,
        student_id: studentId,
        internship_id: internshipId,
        status,
        notes,
        applied_at: status === 'applied' ? now : undefined,
        created_at: now,
        updated_at: now,
      };
      apps.push(updatedApp);
    }
    setLocalItem(KEYS.APPLICATIONS, apps);
    return updatedApp;
  },

  async getRecruiterApplications(recruiterId: string): Promise<Application[]> {
    const internships = await this.getInternships();
    const profiles = await this.getProfiles();
    const recruiterInternshipIds = internships
      .filter((i) => i.recruiter_id === recruiterId)
      .map((i) => i.id);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // If RLS is applied, Supabase already filtered for recruiter's internships.
          // Still filter by recruiter's internship IDs to be completely consistent.
          return data
            .filter((a: any) => recruiterInternshipIds.length === 0 || recruiterInternshipIds.includes(a.internship_id))
            .map((a: any) => ({
              ...a,
              internship: internships.find((i) => i.id === a.internship_id),
              student: profiles.find((p) => p.id === a.student_id),
            })) as Application[];
        }
      } catch (err) {
        console.warn('Supabase getRecruiterApplications error, fallback to local', err);
      }
    }

    const apps = getLocalItem<Application[]>(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const recruiterApps = apps.filter((a) => recruiterInternshipIds.includes(a.internship_id));

    return recruiterApps.map((a) => ({
      ...a,
      internship: internships.find((i) => i.id === a.internship_id),
      student: profiles.find((p) => p.id === a.student_id),
    }));
  },

  // --- Recruiter Shortlists (Requirement 7: Isolated per recruiter) ---
  async getRecruiterShortlists(recruiterId: string): Promise<RecruiterShortlist[]> {
    const profiles = await this.getProfiles();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('recruiter_shortlists')
          .select('*')
          .eq('recruiter_id', recruiterId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((s: any) => ({
            ...s,
            student: profiles.find((p) => p.id === s.student_id),
          })) as RecruiterShortlist[];
        }
      } catch (err) {
        console.warn('Supabase getRecruiterShortlists error, fallback to local', err);
      }
    }

    const list = getLocalItem<RecruiterShortlist[]>(KEYS.SHORTLISTS, INITIAL_SHORTLISTS);
    const recruiterList = list.filter((s) => s.recruiter_id === recruiterId);

    return recruiterList.map((s) => ({
      ...s,
      student: profiles.find((p) => p.id === s.student_id),
    }));
  },

  async toggleShortlist(
    recruiterId: string,
    internshipId: string,
    studentId: string,
    notes?: string
  ): Promise<boolean> {
    const list = getLocalItem<RecruiterShortlist[]>(KEYS.SHORTLISTS, INITIAL_SHORTLISTS);
    const existingIndex = list.findIndex(
      (s) => s.recruiter_id === recruiterId && s.internship_id === internshipId && s.student_id === studentId
    );

    let isShortlisted = false;

    if (isSupabaseConfigured && supabase) {
      try {
        if (existingIndex >= 0) {
          await supabase
            .from('recruiter_shortlists')
            .delete()
            .eq('recruiter_id', recruiterId)
            .eq('internship_id', internshipId)
            .eq('student_id', studentId);
        } else {
          await supabase.from('recruiter_shortlists').insert({
            recruiter_id: recruiterId,
            internship_id: internshipId,
            student_id: studentId,
            notes: notes || 'Shortlisted for candidate review',
            status: 'shortlisted',
          });
        }
      } catch (err) {
        console.error('Supabase toggleShortlist error', err);
      }
    }

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      isShortlisted = false;
    } else {
      list.push({
        id: `short-${Date.now()}`,
        recruiter_id: recruiterId,
        internship_id: internshipId,
        student_id: studentId,
        notes: notes || 'Shortlisted for candidate review',
        status: 'shortlisted',
        created_at: new Date().toISOString(),
      });
      isShortlisted = true;
    }
    setLocalItem(KEYS.SHORTLISTS, list);
    return isShortlisted;
  },
};
