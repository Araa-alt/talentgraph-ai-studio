# TalentGraph — Explainable Internship Matching Platform

TalentGraph is a full-stack, production-minded internship-matching platform designed for students and recruiters. It solves the internship discovery problem by matching students with opportunities based on verifiable technical skills, demonstrated project deliverables, and hackathon achievements rather than resumes and keywords alone.

---

## 🌟 Key Differentiators

1. **Explainable Matching Engine**: Every recommendation provides a deterministic 0–100% fit score, an explicit breakdown of matched vs missing required and preferred skills, citations of projects/hackathons that prove competence, and a plain-language summary.
2. **Hard Eligibility vs Fit Separation**: Mandatory eligibility rules (graduation year, degree, minimum academic year, work mode) are separated from fit. Hard criteria failures are explicitly flagged as `Ineligible` rather than diluted into an ambiguous score. Missing student data is marked `Needs Confirmation`.
3. **Evidence-Based Skills**: Distinguishes between self-declared skills and skills backed by verified repository deliverables (📁 Project-Backed, 🏆 Hackathon-Backed).
4. **Google-Inspired Design Language**: Built with a clean, high-contrast UI utilizing design tokens inspired by Google's four-color identity:
   - **Google Blue (`#4285F4`)**: Primary actions, navigation, active controls
   - **Google Green (`#34A853`)**: Eligible statuses, positive match tiers, confirmed outcomes
   - **Google Yellow (`#FBBC05`)**: Cautions, missing data, unconfirmed eligibility
   - **Google Red (`#EA4335`)**: Destructive actions, hard ineligibility
5. **Dual Platform Support**:
   - Single responsive React 19 + TypeScript + Tailwind web application
   - Native Android application packaged with Capacitor (`com.talentgraph.app`)
6. **Zero Paid AI Dependencies**: Core matching algorithms are deterministic, transparent, and reproducible without external model APIs.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript (strict mode), Vite 6, Tailwind CSS, Lucide React |
| **Backend & Database** | Supabase PostgreSQL, Row Level Security (RLS), Supabase Auth |
| **Business Logic** | Deterministic TypeScript Matching Engine (`src/engine/matching.ts`) |
| **Mobile & Packaging** | Capacitor 7 Android (`@capacitor/android`, `@capacitor/cli`) |
| **Testing** | Vitest, React Testing Library, jsdom |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js LTS v24.20.0)
- **npm**: v9+ (tested on npm 11.19.0)
- **Git**: Installed and accessible on PATH

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/talentgraph.git
cd talentgraph

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Live Supabase PostgreSQL Backend (Optional - see Demo Mode below)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Application Settings
VITE_APP_NAME=TalentGraph
VITE_DEMO_MODE=true
```

> **⚡ Isolated Demo Mode:** If live Supabase credentials are not provided or remain placeholders, TalentGraph automatically boots into an **Isolated Demo Mode** with rich, reproducible seed data. A top banner will transparently indicate that the application is running in local demonstration mode.

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite powered by Vitest and React Testing Library:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Highlights
- **Skill Normalization**: Case insensitivity, alias resolution (`react.js` ↔ `react`, `ts` ↔ `typescript`, `tailwind` ↔ `tailwindcss`).
- **Hard Eligibility**: Year of graduation boundaries, minimum academic year, degree checks, and missing profile attribute detection (`unknown`).
- **Matching & Evidence**: Exact matches, partial matches, missing required skills, project deliverable associations, hackathon bonuses.
- **Ranking Stability**: Guaranteed prioritization of eligible opportunities over ineligible listings.
- **Component Tests**: Accessible buttons, eligibility badges, fit meters, and modal dialogs.

---

## 📦 Production Web Build

To verify TypeScript types and bundle the production assets:

```bash
npm run build
```
Build outputs are generated in `dist/`. To preview the production bundle locally:
```bash
npm run preview
```

---

## 📱 Android APK Packaging (Capacitor)

The project includes pre-configured Capacitor Android integration located in `android/`:
- **App Name**: `TalentGraph`
- **Package ID**: `com.talentgraph.app`
- **Web Directory**: `dist`

### 1. Sync Web Assets to Android
Whenever you modify web assets and build:
```bash
npm run build
npx cap sync
```

### 2. Generating Android APK
> ⚠️ **Prerequisite Note**: Android Gradle 8.11.1 requires **JDK 17 or JDK 21** and the **Android SDK / Android Studio** installed. If your default system JDK is Java 22+ (e.g. Java 26), set `JAVA_HOME` to a JDK 17 or 21 installation before running Gradle.

#### Option A: Using Android Studio (Recommended)
```bash
npx cap open android
```
1. Open the project in Android Studio.
2. Allow Gradle sync to complete.
3. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Your debug APK will be generated at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Command Line (with JDK 17/21 & Android SDK configured)
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"  # Adjust to your JDK 17 path
$env:ANDROID_HOME = "C:\Users\<user>\AppData\Local\Android\Sdk"
cd android
.\gradlew assembleDebug
```

---

## 🗄️ Database Schema & Supabase Setup

All PostgreSQL migrations and reproducible seed datasets are versioned in `supabase/`:
- `supabase/migrations/20261009000000_initial_schema.sql`: Full DDL with Row Level Security (RLS) policies.
- `supabase/seed.sql`: Realistic reproducible test profiles, projects, hackathons, and listings.

### Manual Setup via Supabase Dashboard:
1. Create a project on [Supabase](https://supabase.com).
2. Open **SQL Editor**.
3. Run `supabase/migrations/20261009000000_initial_schema.sql`.
4. Run `supabase/seed.sql`.
5. Copy your **Project URL** and **anon public key** from Project Settings > API into your `.env` file.

---

## 🌐 Deployment to Vercel

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/talentgraph.git
   git branch -M main
   git push -u origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Set the Framework Preset to **Vite**.
4. Configure environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Click **Deploy**.

---

## 👥 Demo Personas for Quick Testing

Use the profile switcher in the top navigation to test all perspectives:

1. **Alex Rivera (Student)**:
   - 3rd year B.Tech student in CS
   - Verified project evidence in React, TypeScript, and Tailwind CSS (`OpenTask`, `PulseUI`)
   - 1st Place Hackathon winner (`HealthSync IoT Alert Router`)
2. **Priya Sharma (Student)**:
   - 4th year B.E. student in IT
   - Verified backend project in PostgreSQL, Docker, and Node.js (`Distributed Rate Limiter`)
3. **Marcus Vance (Recruiter)**:
   - Engineering Talent Partner at NovaScale Technologies
   - Manage listings, post new roles with custom eligibility rules, rank incoming candidates with explainable breakdowns, and curate private shortlists.

---

## 📄 License
MIT License. Built for students and engineering recruiters.
