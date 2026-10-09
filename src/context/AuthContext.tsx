import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types/database';
import { db } from '../lib/db';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_PROFILES } from '../lib/mockData';

export const DEMO_STORAGE_KEY = 'talentgraph_demo_active';

interface AuthContextType {
  authUser: User | null;
  session: Session | null;
  currentProfile: Profile | null;
  currentRole: UserRole | 'visitor';
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isSupabaseConnected: boolean;
  needsOnboarding: boolean;
  loading: boolean;
  authError: string | null;

  // Real Supabase Auth operations
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  completeOnboarding: (profileData: Partial<Profile>) => Promise<Profile>;

  // Profile operations
  updateCurrentProfile: (profile: Profile) => Promise<void>;

  // Demo Mode management
  enterDemoMode: (targetRoleOrPersona?: string) => void;
  exitDemoMode: () => void;
  switchProfile: (profileId: string) => Promise<void>;
  switchRole: (role: UserRole | 'visitor') => void;
  availableProfiles: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  // Fresh unauthenticated visitor always starts with 'visitor' role
  const [currentRole, setCurrentRole] = useState<UserRole | 'visitor'>('visitor');
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load profile for authenticated Supabase user
  const loadAuthenticatedProfile = useCallback(async (user: User) => {
    try {
      const profile = await db.getProfile(user.id);
      if (profile) {
        // Role is strictly derived from the verified database record
        setCurrentProfile(profile);
        setCurrentRole(profile.role);
        setNeedsOnboarding(false);
      } else {
        // Authenticated user does not have a profile row yet -> trigger onboarding
        setCurrentProfile(null);
        setNeedsOnboarding(true);
        const metaRole = (user.user_metadata?.role as UserRole) || 'student';
        setCurrentRole(metaRole);
      }
      setIsDemoMode(false);
      try {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
        localStorage.removeItem(DEMO_STORAGE_KEY);
      } catch (err) {
        console.warn('Storage clear error', err);
      }
    } catch (err) {
      console.error('Failed to load profile for user', err);
      setNeedsOnboarding(true);
    }
  }, []);

  // Initialize Auth state & session restoration
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const demoProfiles = await db.getProfiles();
        if (mounted) {
          setAvailableProfiles(demoProfiles);
        }

        // 1. If Supabase is configured, check for live active session
        if (isSupabaseConfigured && supabase) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) {
            console.warn('Supabase getSession error', sessionErr);
          }

          if (mounted && sessionData?.session?.user) {
            setSession(sessionData.session);
            setAuthUser(sessionData.session.user);
            await loadAuthenticatedProfile(sessionData.session.user);
            return;
          }
        }

        // 2. If unauthenticated, check whether user explicitly opted into Demo Mode in this browser session
        let isDemoActive = false;
        try {
          isDemoActive = sessionStorage.getItem(DEMO_STORAGE_KEY) === 'true';
        } catch {
          isDemoActive = false;
        }

        if (mounted) {
          if (isDemoActive) {
            setIsDemoMode(true);
            const defaultDemo = demoProfiles.find((p) => p.role === 'student') || demoProfiles[0] || null;
            setCurrentProfile(defaultDemo);
            setCurrentRole(defaultDemo ? defaultDemo.role : 'student');
          } else {
            // Fresh unauthenticated visitor -> ALWAYS landing page first
            setIsDemoMode(false);
            setCurrentProfile(null);
            setCurrentRole('visitor');
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth', err);
        if (mounted) {
          setIsDemoMode(false);
          setCurrentProfile(null);
          setCurrentRole('visitor');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Listen for auth state changes if Supabase client is active
    let authListener: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setAuthUser(newSession?.user || null);

        if (newSession?.user) {
          await loadAuthenticatedProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setCurrentProfile(null);
          setCurrentRole('visitor');
          setNeedsOnboarding(false);
          setIsDemoMode(false);
          try {
            sessionStorage.removeItem(DEMO_STORAGE_KEY);
            localStorage.removeItem(DEMO_STORAGE_KEY);
          } catch (err) {
            console.warn(err);
          }
        }
      });
      authListener = listener.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, [loadAuthenticatedProfile]);

  // Sign In using Supabase Auth
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setAuthUser(data.user);
        setSession(data.session);
        await loadAuthenticatedProfile(data.user);
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up using Supabase Auth
  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setAuthUser(data.user);
        setSession(data.session);

        // If session is immediately active (email confirmation not required)
        if (data.session) {
          const newProfile: Profile = {
            id: data.user.id, // Foreign key to auth.users.id
            email: data.user.email || email,
            role,
            full_name: fullName,
            preferred_roles: [],
            preferred_locations: [],
            preferred_work_modes: ['remote', 'hybrid', 'onsite'],
            skills: [],
            projects: [],
            hackathons: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const created = await db.createProfile(newProfile);
          setCurrentProfile(created);
          setCurrentRole(created.role);
          setNeedsOnboarding(false);
          setIsDemoMode(false);
          try {
            sessionStorage.removeItem(DEMO_STORAGE_KEY);
            localStorage.removeItem(DEMO_STORAGE_KEY);
          } catch (e) {
            console.warn(e);
          }
          return { success: true };
        } else {
          return { success: true, requiresEmailConfirmation: true };
        }
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out: Clears session and returns to visitor landing page
  const signOut = async () => {
    setLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Sign out error', err);
    } finally {
      setAuthUser(null);
      setSession(null);
      setCurrentProfile(null);
      setCurrentRole('visitor');
      setNeedsOnboarding(false);
      setIsDemoMode(false);
      try {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
        localStorage.removeItem(DEMO_STORAGE_KEY);
      } catch (err) {
        console.warn('Storage cleanup error', err);
      }
      setLoading(false);
    }
  };

  // Onboarding Completion
  const completeOnboarding = async (profileData: Partial<Profile>): Promise<Profile> => {
    if (!authUser) {
      throw new Error('Must be authenticated with Supabase to complete profile onboarding');
    }

    const assignedRole = (profileData.role || authUser.user_metadata?.role || currentRole || 'student') as UserRole;

    const profile: Profile = {
      id: authUser.id,
      email: authUser.email || '',
      role: assignedRole,
      full_name: profileData.full_name || authUser.user_metadata?.full_name || 'Anonymous User',
      avatar_url: profileData.avatar_url,
      institution: profileData.institution,
      degree: profileData.degree,
      field_of_study: profileData.field_of_study,
      current_year: profileData.current_year,
      graduation_year: profileData.graduation_year,
      bio: profileData.bio,
      preferred_roles: profileData.preferred_roles || [],
      preferred_locations: profileData.preferred_locations || [],
      preferred_work_modes: profileData.preferred_work_modes || ['remote', 'hybrid', 'onsite'],
      github_url: profileData.github_url,
      portfolio_url: profileData.portfolio_url,
      resume_url: profileData.resume_url,
      skills: [],
      projects: [],
      hackathons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await db.createProfile(profile);
    setCurrentProfile(created);
    setCurrentRole(created.role);
    setNeedsOnboarding(false);
    return created;
  };

  const updateCurrentProfile = async (updated: Profile) => {
    const saved = await db.updateProfile(updated);
    setCurrentProfile(saved);
    setAvailableProfiles((prev) =>
      prev.map((p) => (p.id === saved.id ? saved : p))
    );
  };

  // Demo Mode Handlers: Explicit user activation & exit
  const enterDemoMode = (targetRoleOrPersona?: string) => {
    try {
      sessionStorage.setItem(DEMO_STORAGE_KEY, 'true');
      localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    } catch (err) {
      console.warn('Storage error on enterDemoMode', err);
    }

    setIsDemoMode(true);
    setNeedsOnboarding(false);

    if (targetRoleOrPersona === 'recruiter') {
      const defaultRecruiter = availableProfiles.find((p) => p.role === 'recruiter') || null;
      setCurrentProfile(defaultRecruiter);
      setCurrentRole('recruiter');
      return;
    }

    if (targetRoleOrPersona && targetRoleOrPersona !== 'student') {
      const match = availableProfiles.find((p) => p.id === targetRoleOrPersona);
      if (match) {
        setCurrentProfile(match);
        setCurrentRole(match.role);
        return;
      }
    }

    // Default to student demo
    const defaultStudent = availableProfiles.find((p) => p.role === 'student') || availableProfiles[0] || null;
    setCurrentProfile(defaultStudent);
    setCurrentRole(defaultStudent ? defaultStudent.role : 'student');
  };

  // Exit Demo Mode: Clears demo flag and immediately returns to Visitor Landing page
  const exitDemoMode = () => {
    try {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch (err) {
      console.warn('Storage error on exitDemoMode', err);
    }

    setIsDemoMode(false);
    if (authUser) {
      loadAuthenticatedProfile(authUser);
    } else {
      setCurrentProfile(null);
      setCurrentRole('visitor');
    }
  };

  const switchProfile = async (profileId: string) => {
    const found = availableProfiles.find((p) => p.id === profileId);
    if (found) {
      setCurrentProfile(found);
      setCurrentRole(found.role);
    } else {
      const fresh = await db.getProfile(profileId);
      if (fresh) {
        setCurrentProfile(fresh);
        setCurrentRole(fresh.role);
      }
    }
  };

  const switchRole = (role: UserRole | 'visitor') => {
    setCurrentRole(role);
    if (role === 'visitor') {
      exitDemoMode();
    } else {
      const matching = availableProfiles.find((p) => p.role === role);
      if (matching) {
        setCurrentProfile(matching);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        session,
        currentProfile,
        currentRole,
        isAuthenticated: !!authUser || isDemoMode,
        isDemoMode,
        isSupabaseConnected: isSupabaseConfigured,
        needsOnboarding,
        loading,
        authError,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
        updateCurrentProfile,
        enterDemoMode,
        exitDemoMode,
        switchProfile,
        switchRole,
        availableProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
