# TalentGraph Database Setup

This directory contains versioned PostgreSQL migrations and reproducible seed data for **TalentGraph**.

## Schema Overview

- `profiles`: Multi-role accounts (students & recruiters) with academic and preference metadata
- `skills`: Canonical normalized skills dictionary
- `profile_skills`: Student declared skills with associated evidence types (`self_declared`, `project_backed`, `hackathon_backed`)
- `projects`: Student projects detailing technical role, contributions, repository/live links, and demonstrated skills
- `hackathon_experiences`: Hackathon entries with specific contributions, technologies, and achievements
- `internships`: Recruiter internship listings with strict eligibility criteria (allowed grad years, minimum academic year, allowed degrees) and required/preferred skills
- `saved_internships`: Student bookmarks
- `applications`: Student application progress tracker (`interested` -> `applied` -> `interview` -> `offer`, etc.)
- `recruiter_shortlists`: Recruiter-private candidate shortlists and notes

## Applying Migrations & Seed Data

### Option 1: Supabase CLI
```bash
supabase db reset
```

### Option 2: Supabase Web Dashboard (SQL Editor)
1. Open your project on [https://supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy and run `migrations/20261009000000_initial_schema.sql`.
4. Copy and run `seed.sql`.
