-- TalentGraph Database Schema Migration
-- PostgreSQL / Supabase
-- Version: 20261009000000

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('student', 'recruiter');
CREATE TYPE work_mode AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE evidence_type AS ENUM ('self_declared', 'project_backed', 'hackathon_backed');
CREATE TYPE application_status AS ENUM ('interested', 'applied', 'interview', 'offer', 'rejected', 'withdrawn', 'closed');
CREATE TYPE internship_status AS ENUM ('active', 'closed', 'draft');

-- 2. Profiles Table (extends Supabase auth.users or standalone UUIDs)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
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

-- 3. Skills Table (Normalized canonical skills)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  normalized_name TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_skills_normalized ON skills(normalized_name);

-- 4. Profile Skills (Links students with declared/verified skills)
CREATE TABLE IF NOT EXISTS profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level proficiency_level NOT NULL DEFAULT 'intermediate',
  evidence_type evidence_type NOT NULL DEFAULT 'self_declared',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, skill_id)
);

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
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_work_mode ON internships(work_mode);

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

-- 11. Saved Internships (Student Bookmarks)
CREATE TABLE IF NOT EXISTS saved_internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, internship_id)
);

-- 12. Applications Table (Student Progress Tracker)
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

-- 13. Recruiter Shortlists (Private recruiter evaluations)
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

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
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

-- Skills: Viewable by anyone, inserted by authenticated users
CREATE POLICY "Skills are readable by all" ON skills FOR SELECT USING (true);
CREATE POLICY "Skills can be inserted by authenticated users" ON skills FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Profiles:
-- Public can read student profiles for candidate matching, or own profile
CREATE POLICY "Profiles readable by authenticated users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects:
CREATE POLICY "Projects readable by all authenticated users" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = profile_id);

-- Hackathons:
CREATE POLICY "Hackathons readable by all authenticated users" ON hackathon_experiences FOR SELECT USING (true);
CREATE POLICY "Users can manage own hackathons" ON hackathon_experiences FOR ALL USING (auth.uid() = profile_id);

-- Internships:
-- Active internships readable by all; recruiters can manage their own
CREATE POLICY "Active internships are viewable by all" ON internships FOR SELECT USING (status = 'active' OR auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can insert internships" ON internships FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can update own internships" ON internships FOR UPDATE USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can delete own internships" ON internships FOR DELETE USING (auth.uid() = recruiter_id);

-- Saved Internships:
CREATE POLICY "Students can view own saved internships" ON saved_internships FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can manage own saved internships" ON saved_internships FOR ALL USING (auth.uid() = student_id);

-- Applications:
-- Students view & manage own applications; Recruiters can view applications for their internships
CREATE POLICY "Students can manage own applications" ON applications FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Recruiters can view applications for their internships" ON applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM internships
    WHERE internships.id = applications.internship_id
    AND internships.recruiter_id = auth.uid()
  )
);

-- Recruiter Shortlists:
-- Strictly private to the recruiter who created them
CREATE POLICY "Recruiters manage own shortlists" ON recruiter_shortlists FOR ALL USING (auth.uid() = recruiter_id);
