-- TalentGraph Reproducible Demo Seed Data
-- Note: All sample records are clearly labeled for testing and demonstration.

-- 1. Insert Skills
INSERT INTO skills (id, name, category, normalized_name) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'React', 'Frontend', 'react'),
  ('a0000001-0000-0000-0000-000000000002', 'TypeScript', 'Language', 'typescript'),
  ('a0000001-0000-0000-0000-000000000003', 'Node.js', 'Backend', 'node'),
  ('a0000001-0000-0000-0000-000000000004', 'PostgreSQL', 'Database', 'postgresql'),
  ('a0000001-0000-0000-0000-000000000005', 'Python', 'Language', 'python'),
  ('a0000001-0000-0000-0000-000000000006', 'Tailwind CSS', 'Frontend', 'tailwindcss'),
  ('a0000001-0000-0000-0000-000000000007', 'Docker', 'DevOps', 'docker'),
  ('a0000001-0000-0000-0000-000000000008', 'GraphQL', 'Backend', 'graphql'),
  ('a0000001-0000-0000-0000-000000000009', 'Machine Learning', 'Data Science', 'machine learning'),
  ('a0000001-0000-0000-0000-000000000010', 'Next.js', 'Frontend', 'nextjs')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Profiles (Students and Recruiters)
INSERT INTO profiles (id, email, role, is_approved, full_name, institution, degree, field_of_study, current_year, graduation_year, bio, preferred_roles, preferred_locations, preferred_work_modes, github_url, portfolio_url) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'alex.rivera@demo.talentgraph.io', 'student', true, 'Alex Rivera', 'Apex Institute of Technology', 'B.Tech', 'Computer Science & Engineering', 3, 2026, 'Full-stack builder passionate about reactive systems and accessible design.', ARRAY['Full Stack Developer', 'Frontend Engineer'], ARRAY['Bangalore', 'Remote'], ARRAY['remote'::work_mode, 'hybrid'::work_mode], 'https://github.com/alexrivera-demo', 'https://alexrivera.dev'),
  ('b0000001-0000-0000-0000-000000000002', 'priya.sharma@demo.talentgraph.io', 'student', true, 'Priya Sharma', 'National Engineering College', 'B.E.', 'Information Technology', 4, 2025, 'Backend enthusiast focused on distributed systems, databases, and microservices.', ARRAY['Backend Engineer', 'Cloud Developer'], ARRAY['Hyderabad', 'Remote'], ARRAY['remote'::work_mode], 'https://github.com/priyasharma-demo', 'https://priyasharma.io'),
  ('b0000001-0000-0000-0000-000000000003', 'marcus.vance@demo.talentgraph.io', 'recruiter', true, 'Marcus Vance', 'NovaScale Technologies', NULL, NULL, NULL, NULL, 'Head of Engineering Talent at NovaScale Technologies.', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::work_mode[], NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Link Student Skills with Evidence
INSERT INTO profile_skills (profile_id, skill_id, proficiency_level, evidence_type) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'advanced', 'project_backed'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'advanced', 'project_backed'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'intermediate', 'hackathon_backed'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000006', 'advanced', 'project_backed')
ON CONFLICT (profile_id, skill_id) DO NOTHING;

-- 4. Student Projects
INSERT INTO projects (id, profile_id, title, description, role, contribution, outcomes, repo_url) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'OpenTask Kanban Platform', 'Real-time collaborative workspace with drag-and-drop state management.', 'Lead Frontend Engineer', 'Designed state synchronization pipeline using TypeScript and React.', 'Active usage by 150+ university students during finals sprint.', 'https://github.com/alexrivera-demo/opentask')
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_skills (project_id, skill_id) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002'),
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000006')
ON CONFLICT (project_id, skill_id) DO NOTHING;

-- 5. Student Hackathons
INSERT INTO hackathon_experiences (id, profile_id, event_name, project_name, role, contribution, achievement, repo_url, event_date) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'HackVerse 2026', 'HealthSync IoT Gateway', 'Full Stack Developer', 'Built Node.js real-time alert router and React dashboard.', '1st Place in Healthcare Track (out of 45 teams)', 'https://github.com/alexrivera-demo/healthsync', '2026-03-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hackathon_skills (hackathon_id, skill_id) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003')
ON CONFLICT (hackathon_id, skill_id) DO NOTHING;

-- 6. Recruiter Internship Listings
INSERT INTO internships (id, recruiter_id, title, organization, description, responsibilities, location, work_mode, duration, stipend, deadline, application_url, contact_info, status, eligible_degrees, eligible_grad_years, eligible_min_year) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 'Frontend Software Engineer Intern', 'NovaScale Technologies', 'Join our core web experience team building scalable customer interfaces.', ARRAY['Build reusable React and TypeScript components', 'Collaborate with UX team on design system implementations', 'Write unit and integration tests using Vitest'], 'Bangalore', 'remote', '6 Months', '$1,200/month', '2026-12-15', 'https://novascale.example.com/careers/frontend-intern', 'careers@novascale.example.com', 'active', ARRAY['B.Tech', 'B.E.', 'BS in Computer Science'], ARRAY[2026, 2027], 3),
  ('e0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 'Full Stack Cloud Platform Intern', 'NovaScale Technologies', 'Help scale distributed microservices and dashboard observability.', ARRAY['Build REST & GraphQL endpoints with Node.js and PostgreSQL', 'Optimize client-side query caching and data streaming', 'Maintain Docker development pipelines'], 'Bangalore', 'hybrid', '6 Months', '$1,400/month', '2026-11-30', 'https://novascale.example.com/careers/cloud-intern', 'careers@novascale.example.com', 'active', ARRAY['B.Tech', 'B.E.', 'MCA'], ARRAY[2025, 2026], 3),
  ('e0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', 'Data Science & ML Research Intern', 'AetherMind AI Labs', 'Develop prompt-chain pipelines and regression modeling workflows.', ARRAY['Conduct data validation on tabular benchmarks', 'Implement feature transformation pipelines in Python', 'Document research evaluations and error logs'], 'Hyderabad', 'onsite', '3 Months', '$1,000/month', '2026-10-31', 'https://aethermind.example.com/apply', 'recruitment@aethermind.example.com', 'active', ARRAY['M.Tech', 'MS in Data Science', 'B.Tech'], ARRAY[2025, 2026], 3)
ON CONFLICT (id) DO NOTHING;

-- 7. Internship Skill Associations
INSERT INTO internship_required_skills (internship_id, skill_id) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'),
  ('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002'),
  ('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000006'),
  ('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002'),
  ('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000003'),
  ('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004'),
  ('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000005'),
  ('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000009')
ON CONFLICT (internship_id, skill_id) DO NOTHING;

INSERT INTO internship_preferred_skills (internship_id, skill_id) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000010'),
  ('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000007'),
  ('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000008')
ON CONFLICT (internship_id, skill_id) DO NOTHING;
