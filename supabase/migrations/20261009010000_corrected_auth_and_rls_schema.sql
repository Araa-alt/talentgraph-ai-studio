-- TalentGraph Corrected Database Schema Migration
-- PostgreSQL / Supabase
-- Version: 20261009010000_corrected_auth_and_rls_schema.sql
-- Description: Establishes auth.users foreign key binding, secure recruiter approval,
--              privacy-preserving candidate views, explicit search_path enforcement,
--              and granular, idempotent Row-Level Security (RLS) policies.

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Enums if they do not already exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'recruiter');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE work_mode AS ENUM ('remote', 'hybrid', 'onsite');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_type AS ENUM ('self_declared', 'project_backed', 'hackathon_backed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('interested', 'applied', 'interview', 'offer', 'rejected', 'withdrawn', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE internship_status AS ENUM ('active', 'closed', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table: Explicitly links id to auth.users.id
-- Note: id REFERENCES auth.users(id) guarantees every authenticated user owns their profile.
-- is_approved: Distinguishes pending recruiters (false) from verified recruiters (true).
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  institution TEXT,
  degree TEXT,
  field_of_study TEXT,
  current_year INTEGER CHECK (current_year >= 1 AND current_year <= 6),
  graduation_year INTEGER CHECK (graduation_year >= 2020 AND graduation_year <= 2035),
  bio TEXT,
  preferred_roles TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_work_modes work_mode[] DEFAULT '{remote,hybrid,onsite}',
  github_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for role and approval lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_approved ON profiles(role, is_approved);

-- 3. Skills Table (Normalized canonical catalog)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  normalized_name TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_skills_normalized ON skills(normalized_name);

-- 4. Profile Skills (Verified and self-declared skills tied to candidate)
CREATE TABLE IF NOT EXISTS profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level proficiency_level NOT NULL DEFAULT 'intermediate',
  evidence_type evidence_type NOT NULL DEFAULT 'self_declared',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON profile_skills(profile_id);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  repo_url TEXT,
  live_url TEXT,
  role TEXT NOT NULL,
  contribution TEXT NOT NULL,
  outcomes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_profile_id ON projects(profile_id);

-- 6. Project Skills (Link table)
CREATE TABLE IF NOT EXISTS project_skills (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

-- 7. Hackathon Experiences Table
CREATE TABLE IF NOT EXISTS hackathon_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  role TEXT NOT NULL,
  contribution TEXT NOT NULL,
  achievement TEXT,
  repo_url TEXT,
  event_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hackathons_profile_id ON hackathon_experiences(profile_id);

-- 8. Hackathon Skills (Link table)
CREATE TABLE IF NOT EXISTS hackathon_skills (
  hackathon_id UUID NOT NULL REFERENCES hackathon_experiences(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (hackathon_id, skill_id)
);

-- 9. Internships Table
CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  work_mode work_mode NOT NULL DEFAULT 'remote',
  duration TEXT NOT NULL,
  stipend TEXT,
  deadline DATE,
  application_url TEXT NOT NULL,
  contact_info TEXT,
  status internship_status NOT NULL DEFAULT 'active',
  eligible_degrees TEXT[] DEFAULT '{}',
  eligible_grad_years INTEGER[] DEFAULT '{}',
  eligible_min_year INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_internships_recruiter_id ON internships(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);

-- 10. Internship Required & Preferred Skills
CREATE TABLE IF NOT EXISTS internship_required_skills (
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (internship_id, skill_id)
);

CREATE TABLE IF NOT EXISTS internship_preferred_skills (
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (internship_id, skill_id)
);

-- 11. Saved Internships (Student Bookmarks - isolated per student)
CREATE TABLE IF NOT EXISTS saved_internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, internship_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_internships_student ON saved_internships(student_id);

-- 12. Applications Table (Student Tracker & Recruiter Review)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'interested',
  notes TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, internship_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);

-- 13. Recruiter Shortlists (Private recruiter notes & candidate ranking bookmarks)
CREATE TABLE IF NOT EXISTS recruiter_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  status TEXT DEFAULT 'shortlisted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recruiter_id, internship_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_shortlists_recruiter ON recruiter_shortlists(recruiter_id);

-- =========================================================================
-- SECURE AUTHORIZATION FUNCTIONS & ROLE INTEGRITY (Fixed search_path)
-- =========================================================================

-- Helper: Verifies if user has an APPROVED recruiter account
CREATE OR REPLACE FUNCTION public.is_recruiter(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'recruiter' AND is_approved = true
  );
$$;

-- Helper: Verifies if user has student role
CREATE OR REPLACE FUNCTION public.is_student(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'student'
  );
$$;

-- Trigger: Strictly prevents unauthorized role elevation, self-approval, or user ID tampering
CREATE OR REPLACE FUNCTION public.enforce_profile_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- On INSERT: authenticated client users cannot self-approve as recruiters
  IF TG_OP = 'INSERT' THEN
    IF auth.role() = 'authenticated' OR auth.role() = 'anon' THEN
      IF NEW.role = 'recruiter' THEN
        NEW.is_approved := false;
      ELSE
        NEW.is_approved := true;
      END IF;
    END IF;
  END IF;

  -- On UPDATE:
  IF TG_OP = 'UPDATE' THEN
    -- Prevent altering primary identity
    IF NEW.id <> OLD.id THEN
      RAISE EXCEPTION 'Profile ID cannot be altered';
    END IF;

    -- Prevent altering role
    IF OLD.role IS NOT NULL AND NEW.role <> OLD.role THEN
      RAISE EXCEPTION 'User role cannot be altered after creation';
    END IF;

    -- Prevent authenticated user from self-approving or modifying is_approved
    IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
      IF auth.role() = 'authenticated' OR auth.role() = 'anon' THEN
        RAISE EXCEPTION 'Recruiter approval status can only be modified by database administrators';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_profile_security ON profiles;
CREATE TRIGGER trigger_enforce_profile_security
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_security();

-- Trigger: Prevents application ownership tampering (changing student_id or internship_id)
CREATE OR REPLACE FUNCTION public.prevent_application_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.student_id <> OLD.student_id THEN
      RAISE EXCEPTION 'Application applicant cannot be changed';
    END IF;
    IF NEW.internship_id <> OLD.internship_id THEN
      RAISE EXCEPTION 'Application internship reference cannot be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_application_tampering ON applications;
CREATE TRIGGER trigger_prevent_application_tampering
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_application_tampering();

-- Admin Procedure: Securely approves a pending recruiter
-- Callable ONLY by database administrators or service_role (never client anon/authenticated)
CREATE OR REPLACE FUNCTION public.approve_recruiter(target_recruiter_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' AND current_user NOT IN ('postgres', 'service_role') THEN
    RAISE EXCEPTION 'Access denied: Only database administrators can approve recruiters';
  END IF;

  UPDATE public.profiles
  SET is_approved = true, updated_at = NOW()
  WHERE id = target_recruiter_id AND role = 'recruiter';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recruiter profile not found with ID %', target_recruiter_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_recruiter(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_recruiter(UUID) TO service_role, postgres;

-- =========================================================================
-- PRIVACY-PRESERVING CANDIDATE DIRECTORY VIEW
-- Uses security_invoker = true so caller RLS on profiles is strictly evaluated.
-- Sensitive contact/document fields (email, resume_url) are excluded.
-- =========================================================================
CREATE OR REPLACE VIEW public.candidate_directory
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.role,
  p.full_name,
  p.avatar_url,
  p.institution,
  p.degree,
  p.field_of_study,
  p.current_year,
  p.graduation_year,
  p.bio,
  p.preferred_roles,
  p.preferred_locations,
  p.preferred_work_modes,
  p.github_url,
  p.portfolio_url,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.role = 'student';

REVOKE ALL ON public.candidate_directory FROM PUBLIC, anon;
GRANT SELECT ON public.candidate_directory TO authenticated;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Idempotent: DROP before CREATE)
-- =========================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_preferred_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_shortlists ENABLE ROW LEVEL SECURITY;

-- 1. Skills Policies
DROP POLICY IF EXISTS "Skills are readable by authenticated users" ON skills;
CREATE POLICY "Skills are readable by authenticated users"
  ON skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Skills can be added by authenticated users" ON skills;
CREATE POLICY "Skills can be added by authenticated users"
  ON skills FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Profiles Policies
-- Users can inspect their own full profile completely
DROP POLICY IF EXISTS "Users can view own full profile" ON profiles;
CREATE POLICY "Users can view own full profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- ONLY approved recruiters can view student profiles for discovery
DROP POLICY IF EXISTS "Candidate student profiles visible to authenticated users" ON profiles;
DROP POLICY IF EXISTS "Candidate student profiles visible to approved recruiters" ON profiles;
CREATE POLICY "Candidate student profiles visible to approved recruiters"
  ON profiles FOR SELECT TO authenticated
  USING (
    role = 'student'
    AND public.is_recruiter(auth.uid())
  );

-- Users can only insert their own profile matching auth.uid()
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Profile Skills Policies
-- Visible only to the owner student or an approved recruiter
DROP POLICY IF EXISTS "Profile skills readable by authenticated users" ON profile_skills;
DROP POLICY IF EXISTS "Profile skills readable by owner or approved recruiters" ON profile_skills;
CREATE POLICY "Profile skills readable by owner or approved recruiters"
  ON profile_skills FOR SELECT TO authenticated
  USING (
    auth.uid() = profile_id
    OR public.is_recruiter(auth.uid())
  );

DROP POLICY IF EXISTS "Students can manage own profile skills" ON profile_skills;
CREATE POLICY "Students can manage own profile skills"
  ON profile_skills FOR ALL TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- 4. Projects Policies
-- Visible only to owner student or approved recruiters
DROP POLICY IF EXISTS "Projects readable by authenticated users" ON projects;
DROP POLICY IF EXISTS "Projects readable by owner or approved recruiters" ON projects;
CREATE POLICY "Projects readable by owner or approved recruiters"
  ON projects FOR SELECT TO authenticated
  USING (
    auth.uid() = profile_id
    OR public.is_recruiter(auth.uid())
  );

DROP POLICY IF EXISTS "Students can manage own projects" ON projects;
CREATE POLICY "Students can manage own projects"
  ON projects FOR ALL TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Project skills readable by authenticated users" ON project_skills;
DROP POLICY IF EXISTS "Project skills readable by owner or approved recruiters" ON project_skills;
CREATE POLICY "Project skills readable by owner or approved recruiters"
  ON project_skills FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_skills.project_id
      AND (projects.profile_id = auth.uid() OR public.is_recruiter(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Students can manage own project skills" ON project_skills;
CREATE POLICY "Students can manage own project skills"
  ON project_skills FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_skills.project_id
      AND projects.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_skills.project_id
      AND projects.profile_id = auth.uid()
    )
  );

-- 5. Hackathon Policies
-- Visible only to owner student or approved recruiters
DROP POLICY IF EXISTS "Hackathons readable by authenticated users" ON hackathon_experiences;
DROP POLICY IF EXISTS "Hackathons readable by owner or approved recruiters" ON hackathon_experiences;
CREATE POLICY "Hackathons readable by owner or approved recruiters"
  ON hackathon_experiences FOR SELECT TO authenticated
  USING (
    auth.uid() = profile_id
    OR public.is_recruiter(auth.uid())
  );

DROP POLICY IF EXISTS "Students can manage own hackathons" ON hackathon_experiences;
CREATE POLICY "Students can manage own hackathons"
  ON hackathon_experiences FOR ALL TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Hackathon skills readable by authenticated users" ON hackathon_skills;
DROP POLICY IF EXISTS "Hackathon skills readable by owner or approved recruiters" ON hackathon_skills;
CREATE POLICY "Hackathon skills readable by owner or approved recruiters"
  ON hackathon_skills FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_experiences
      WHERE hackathon_experiences.id = hackathon_skills.hackathon_id
      AND (hackathon_experiences.profile_id = auth.uid() OR public.is_recruiter(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Students can manage own hackathon skills" ON hackathon_skills;
CREATE POLICY "Students can manage own hackathon skills"
  ON hackathon_skills FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_experiences
      WHERE hackathon_experiences.id = hackathon_skills.hackathon_id
      AND hackathon_experiences.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathon_experiences
      WHERE hackathon_experiences.id = hackathon_skills.hackathon_id
      AND hackathon_experiences.profile_id = auth.uid()
    )
  );

-- 6. Internships Policies
-- Active internships readable by all authenticated users; draft/closed by owner recruiter
DROP POLICY IF EXISTS "Active internships readable by all authenticated users" ON internships;
CREATE POLICY "Active internships readable by all authenticated users"
  ON internships FOR SELECT TO authenticated
  USING (status = 'active' OR auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "Only authorized recruiters can create internships" ON internships;
CREATE POLICY "Only authorized recruiters can create internships"
  ON internships FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = recruiter_id
    AND public.is_recruiter(auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can update own internships" ON internships;
CREATE POLICY "Recruiters can update own internships"
  ON internships FOR UPDATE TO authenticated
  USING (
    auth.uid() = recruiter_id
    AND public.is_recruiter(auth.uid())
  )
  WITH CHECK (
    auth.uid() = recruiter_id
    AND public.is_recruiter(auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can delete own internships" ON internships;
CREATE POLICY "Recruiters can delete own internships"
  ON internships FOR DELETE TO authenticated
  USING (
    auth.uid() = recruiter_id
    AND public.is_recruiter(auth.uid())
  );

DROP POLICY IF EXISTS "Internship required skills readable by all" ON internship_required_skills;
CREATE POLICY "Internship required skills readable by all"
  ON internship_required_skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Recruiters can manage required skills for own internships" ON internship_required_skills;
CREATE POLICY "Recruiters can manage required skills for own internships"
  ON internship_required_skills FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = internship_required_skills.internship_id
      AND internships.recruiter_id = auth.uid()
      AND public.is_recruiter(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = internship_required_skills.internship_id
      AND internships.recruiter_id = auth.uid()
      AND public.is_recruiter(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internship preferred skills readable by all" ON internship_preferred_skills;
CREATE POLICY "Internship preferred skills readable by all"
  ON internship_preferred_skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Recruiters can manage preferred skills for own internships" ON internship_preferred_skills;
CREATE POLICY "Recruiters can manage preferred skills for own internships"
  ON internship_preferred_skills FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = internship_preferred_skills.internship_id
      AND internships.recruiter_id = auth.uid()
      AND public.is_recruiter(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = internship_preferred_skills.internship_id
      AND internships.recruiter_id = auth.uid()
      AND public.is_recruiter(auth.uid())
    )
  );

-- 7. Saved Internships Policies (Strict isolation per student)
DROP POLICY IF EXISTS "Students can view only own saved internships" ON saved_internships;
CREATE POLICY "Students can view only own saved internships"
  ON saved_internships FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can manage only own saved internships" ON saved_internships;
CREATE POLICY "Students can manage only own saved internships"
  ON saved_internships FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- 8. Applications Policies
-- Students view own; approved recruiters view only for their posted internships
DROP POLICY IF EXISTS "Students can manage own applications" ON applications;
CREATE POLICY "Students can manage own applications"
  ON applications FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Recruiters can view applications for their posted internships" ON applications;
CREATE POLICY "Recruiters can view applications for their posted internships"
  ON applications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = applications.internship_id
      AND internships.recruiter_id = auth.uid()
      AND public.is_recruiter(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Recruiters can update status of applications for their internships" ON applications;
CREATE POLICY "Recruiters can update status of applications for their internships"
  ON applications FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = applications.internship_id
      AND internships.recruiter_id = auth.uid()
      AND public.is_recruiter(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM internships
      WHERE internships.id = applications.internship_id
      AND internships.recruiter_id = auth.uid()
      AND public.is_recruiter(auth.uid())
    )
  );

-- 9. Recruiter Shortlists Policies (Strictly isolated to approved recruiter who created them)
DROP POLICY IF EXISTS "Recruiters can manage only own shortlists" ON recruiter_shortlists;
CREATE POLICY "Recruiters can manage only own shortlists"
  ON recruiter_shortlists FOR ALL TO authenticated
  USING (
    auth.uid() = recruiter_id
    AND public.is_recruiter(auth.uid())
  )
  WITH CHECK (
    auth.uid() = recruiter_id
    AND public.is_recruiter(auth.uid())
  );

-- =========================================================================
-- DATABASE PRIVILEGES HARDENING
-- Restricts anonymous users from reading or writing application records
-- =========================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Function Execution Permissions
GRANT EXECUTE ON FUNCTION public.is_recruiter(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_student(UUID) TO authenticated, service_role;
