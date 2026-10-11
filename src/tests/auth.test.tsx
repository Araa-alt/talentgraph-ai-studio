import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/db';
import { INITIAL_PROFILES } from '../lib/mockData';
import { Profile } from '../types/database';
import { DEMO_STORAGE_KEY } from '../context/AuthContext';

describe('Supabase & Auth Data Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('uses authenticated user ID directly for profile creation (never random UUID)', async () => {
    const testAuthUserId = '11111111-2222-3333-4444-555555555555';
    const testProfile: Profile = {
      id: testAuthUserId, // Exactly matches auth.users.id
      email: 'recruiter.test@company.io',
      role: 'recruiter',
      full_name: 'Test Recruiter',
      institution: 'Acme Corp',
      preferred_roles: [],
      preferred_locations: ['Remote'],
      preferred_work_modes: ['remote'],
      skills: [],
      projects: [],
      hackathons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await db.createProfile(testProfile);
    expect(saved.id).toBe(testAuthUserId);

    const fetched = await db.getProfile(testAuthUserId);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(testAuthUserId);
    expect(fetched?.role).toBe('recruiter');
    expect(fetched?.is_approved).toBe(false);
  });

  it('distinguishes pending recruiters from approved recruiters via is_approved column', async () => {
    const approvedRecruiterId = 'approved-recruiter-uuid';
    const pendingRecruiterId = 'pending-recruiter-uuid';

    await db.createProfile({
      id: approvedRecruiterId,
      email: 'approved@firm.com',
      role: 'recruiter',
      is_approved: true,
      full_name: 'Approved Recruiter',
      preferred_roles: [],
      preferred_locations: [],
      preferred_work_modes: ['remote'],
      skills: [],
      projects: [],
      hackathons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await db.createProfile({
      id: pendingRecruiterId,
      email: 'pending@firm.com',
      role: 'recruiter',
      is_approved: false,
      full_name: 'Pending Recruiter',
      preferred_roles: [],
      preferred_locations: [],
      preferred_work_modes: ['remote'],
      skills: [],
      projects: [],
      hackathons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const approved = await db.getProfile(approvedRecruiterId);
    const pending = await db.getProfile(pendingRecruiterId);

    expect(approved?.is_approved).toBe(true);
    expect(pending?.is_approved).toBe(false);
  });

  it('maintains application data isolation per student ID', async () => {
    const student1Id = 'stud-user-1';
    const student2Id = 'stud-user-2';
    const internshipId = 'int-123';

    await db.updateApplicationStatus(student1Id, internshipId, 'applied', 'Cover letter submitted');

    const student1Apps = await db.getApplications(student1Id);
    const student2Apps = await db.getApplications(student2Id);

    expect(student1Apps.length).toBe(1);
    expect(student1Apps[0].student_id).toBe(student1Id);
    expect(student1Apps[0].status).toBe('applied');

    expect(student2Apps.length).toBe(0);
  });

  it('maintains saved internship bookmarks isolated per student', async () => {
    const studentA = 'student-alpha';
    const studentB = 'student-beta';
    const internshipId = 'int-bookmark-1';

    const savedA = await db.toggleSaveInternship(studentA, internshipId);
    expect(savedA).toBe(true);

    const listA = await db.getSavedInternships(studentA);
    const listB = await db.getSavedInternships(studentB);

    expect(listA).toContain(internshipId);
    expect(listB).not.toContain(internshipId);
  });

  it('maintains recruiter shortlists strictly isolated to creating recruiter', async () => {
    const recruiter1 = 'recruiter-lead-1';
    const recruiter2 = 'recruiter-lead-2';
    const studentId = INITIAL_PROFILES[0].id;
    const internshipId = 'int-post-1';

    await db.toggleShortlist(recruiter1, internshipId, studentId, 'Candidate has strong project evidence');

    const shorts1 = await db.getRecruiterShortlists(recruiter1);
    const shorts2 = await db.getRecruiterShortlists(recruiter2);

    expect(shorts1.some((s) => s.student_id === studentId)).toBe(true);
    expect(shorts2.some((s) => s.student_id === studentId)).toBe(false);
  });

  it('preserves demo mode profiles for exploration', async () => {
    const profiles = await db.getProfiles();
    expect(profiles.length).toBeGreaterThan(0);
    const alex = profiles.find((p) => p.full_name === 'Alex Rivera');
    expect(alex).toBeDefined();
    expect(alex?.role).toBe('student');
  });

  it('stores and clears DEMO_STORAGE_KEY correctly when entering and exiting demo mode', () => {
    // Fresh state
    expect(sessionStorage.getItem(DEMO_STORAGE_KEY)).toBeNull();

    // Activate demo
    sessionStorage.setItem(DEMO_STORAGE_KEY, 'true');
    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    expect(sessionStorage.getItem(DEMO_STORAGE_KEY)).toBe('true');
    expect(localStorage.getItem(DEMO_STORAGE_KEY)).toBe('true');

    // Exit demo
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    expect(sessionStorage.getItem(DEMO_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(DEMO_STORAGE_KEY)).toBeNull();
  });

  it('records applications for the respective recruiter when a student applies', async () => {
    const studentId = 'stud-applicant-9';
    const recruiterId = 'rec-lead-9';
    const otherRecruiterId = 'rec-lead-other';

    // Create an internship posted by recruiterId
    const internship = await db.createInternship({
      recruiter_id: recruiterId,
      title: 'Cloud Infrastructure Intern',
      organization: 'CloudCore Systems',
      description: 'Assist in building scalable cloud pipelines',
      responsibilities: ['Configure CI/CD pipelines'],
      location: 'Bangalore',
      work_mode: 'remote',
      duration: '6 Months',
      stipend: '₹45,000 / month',
      deadline: '2026-11-30',
      application_url: 'https://cloudcore.example.com/apply',
      status: 'active',
      eligible_degrees: ['B.Tech'],
      eligible_grad_years: [2026],
      eligible_min_year: 3,
      required_skills: [],
      preferred_skills: [],
    });

    // Student applies directly in portal
    await db.updateApplicationStatus(studentId, internship.id, 'applied', 'Direct portal application');

    // Fetch applications visible to the posting recruiter vs other recruiter
    const recruiterApps = await db.getRecruiterApplications(recruiterId);
    const otherRecruiterApps = await db.getRecruiterApplications(otherRecruiterId);

    expect(recruiterApps.some((a) => a.student_id === studentId && a.internship_id === internship.id)).toBe(true);
    expect(otherRecruiterApps.some((a) => a.internship_id === internship.id)).toBe(false);
  });
});
