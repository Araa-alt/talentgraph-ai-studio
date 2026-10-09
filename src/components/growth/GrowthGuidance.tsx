import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Tabs } from '../common/Tabs';
import {
  Award,
  FileText,
  Briefcase,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const GrowthGuidance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');

  const tabs = [
    { id: 'projects', label: 'Project Ideas for Skill Proof', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'hackathons', label: 'Curated Hackathon Events', icon: <Award className="w-4 h-4" /> },
    { id: 'resume', label: 'Evidence-Based Resume Guide', icon: <FileText className="w-4 h-4" /> },
  ];

  const projectSuggestions = [
    {
      title: 'High-Concurrency In-Memory Key-Value Store',
      demonstrates: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      description: 'Build an in-memory cache server with LRU eviction and persistence to PostgreSQL. Measure throughput benchmarks using k6.',
      deliverables: 'Benchmarked GitHub repo with CI/CD action and Docker container.',
      whyItMatters: 'Demonstrates systems programming, query performance, and concurrency handling beyond basic CRUD tutorials.',
    },
    {
      title: 'Accessible Reactive Design System with Storybook',
      demonstrates: ['React', 'TypeScript', 'Tailwind CSS', 'Vitest'],
      description: 'Construct a reusable component library with WCAG 2.1 AA keyboard trap handling, color contrast compliance, and automated snapshot tests.',
      deliverables: 'npm package release or Storybook demo with 90%+ test coverage.',
      whyItMatters: 'Proves frontend architecture maturity, design token systems, and accessibility empathy.',
    },
    {
      title: 'Real-Time Telemetry & Alert Streamer',
      demonstrates: ['Python', 'Docker', 'Machine Learning', 'PostgreSQL'],
      description: 'An anomaly detection stream worker that ingests simulated sensor records and classifies anomalies with statistical models.',
      deliverables: 'Reproducible Jupyter notebook and lightweight REST inference microservice.',
      whyItMatters: 'Bridges raw data science theory with real-time operational software engineering.',
    },
  ];

  const sampleHackathons = [
    {
      title: 'OpenHacks Global 2026',
      dates: 'November 14-16, 2026',
      tracks: 'Developer Tools, Web Performance, Accessible UI',
      eligibility: 'Open to all enrolled university students worldwide',
      link: 'https://openhacks.example.com',
      status: 'Upcoming (Sample Entry)',
    },
    {
      title: 'CloudSprint Collegiate Sprint',
      dates: 'December 05-07, 2026',
      tracks: 'Distributed Databases, Microservices, Cloud Native',
      eligibility: 'Undergraduate engineering teams (max 4 members)',
      link: 'https://cloudsprint.example.com',
      status: 'Registration Open (Sample Entry)',
    },
    {
      title: 'AI Impact Hackathon',
      dates: 'January 23-25, 2027',
      tracks: 'Applied Machine Learning, Healthcare Systems',
      eligibility: 'Undergraduate and graduate students',
      link: 'https://ai-impact.example.com',
      status: 'Curated Demo Listing',
    },
  ];

  const resumeGuidance = [
    {
      rule: 'State Your Personal Contribution, Not Just the Team Summary',
      bad: 'Built a full-stack e-commerce website with my team.',
      good: 'Architected the payment webhook consumer in Node.js and TypeScript, handling idempotent retries with zero lost orders.',
    },
    {
      rule: 'Cite Measurable Outcomes & Real Usage',
      bad: 'Made a fast and responsive user interface.',
      good: 'Reduced initial page load Largest Contentful Paint (LCP) from 3.4s to 1.1s by implementing route-based code splitting and SVG asset optimization.',
    },
    {
      rule: 'Link Directly to Inspectable Evidence',
      bad: 'Created multiple projects on GitHub.',
      good: 'Every listed project includes a direct link to a clean repository with an architectural README, unit tests, and a live demo deployment.',
    },
    {
      rule: 'Differentiate Self-Declared Skills from Verified Evidence',
      bad: 'Listing 25 languages and frameworks in a wall of keywords.',
      good: 'Focus on 5-8 primary technologies where you can point to actual repository commits, code architecture, or hackathon deliverables.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Growth &amp; Evidence Guidance
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Bridge your skill gaps with high-impact project ideas and evidence-backed resume tactics.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'projects' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Recruiters value practical projects that solve realistic technical problems over generic copycat tutorials:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projectSuggestions.map((proj, i) => (
              <Card key={i} className="flex flex-col justify-between border-slate-200">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">{proj.title}</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {proj.demonstrates.map((s, idx) => (
                      <Badge key={idx} variant="blue" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {proj.description}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-3">
                    <strong className="text-slate-700">Deliverable:</strong>
                    <p className="text-slate-600 mt-0.5">{proj.deliverables}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-[#137333] font-medium flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{proj.whyItMatters}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hackathons' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#FEF7E0]/60 border border-[#FEEFC3] text-xs text-[#B06000]">
            <strong>Note on Sample Events:</strong> Hackathon entries below are curated sample events provided for demonstration and testing purposes.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sampleHackathons.map((h, i) => (
              <Card key={i} className="flex flex-col justify-between border-slate-200">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-slate-900">{h.title}</h3>
                    <Badge variant="yellow" size="sm">
                      {h.status}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-[#4285F4] mb-2">{h.dates}</div>
                  <div className="text-xs text-slate-600 mb-2">
                    <strong>Tracks:</strong> {h.tracks}
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    <strong>Eligibility:</strong> {h.eligibility}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Sample Registry</span>
                  <a
                    href={h.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1A73E8] hover:underline flex items-center gap-1 font-semibold"
                  >
                    Event Details <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Transform ambiguous bullet points into verifiable technical statements:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumeGuidance.map((g, i) => (
              <Card key={i} className="border-slate-200 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  {i + 1}. {g.rule}
                </h3>

                <div className="p-3 rounded-lg bg-[#FCE8E6]/50 border border-[#FAD2CF] text-xs text-slate-700">
                  <span className="font-bold text-[#C5221F] block mb-0.5">✕ Avoid Vague Claims:</span>
                  "{g.bad}"
                </div>

                <div className="p-3 rounded-lg bg-[#E6F4EA]/60 border border-[#CEEAD6] text-xs text-slate-700">
                  <span className="font-bold text-[#137333] block mb-0.5">✓ Use Verifiable Evidence:</span>
                  "{g.good}"
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
