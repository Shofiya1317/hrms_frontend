'use client';

import React, { useState } from 'react';
import {
  Plus, ChevronRight, CheckCircle, Briefcase,
} from 'lucide-react';

const TABS = ['Recruitment', 'Onboarding', 'Lifecycle', 'Performance'];

const JOB_OPENINGS = [
  {
    id: 1, title: 'Senior React Developer', dept: 'Engineering', location: 'Bangalore', applicants: 24, stage: 'Interviewing', posted: '10 Mar 2026',
  },
  {
    id: 2, title: 'HR Business Partner', dept: 'Human Resources', location: 'Mumbai', applicants: 18, stage: 'Screening', posted: '05 Mar 2026',
  },
  {
    id: 3, title: 'Sales Manager', dept: 'Sales', location: 'Delhi', applicants: 31, stage: 'Offer', posted: '01 Mar 2026',
  },
  {
    id: 4, title: 'DevOps Engineer', dept: 'Engineering', location: 'Bangalore', applicants: 12, stage: 'Applied', posted: '15 Mar 2026',
  },
];

const CANDIDATES = [
  {
    name: 'Aditya Kumar', role: 'Senior React Developer', stage: 'Technical Round 2', score: 87, avatar: 'AK',
  },
  {
    name: 'Meera Joshi', role: 'HR Business Partner', stage: 'HR Interview', score: 91, avatar: 'MJ',
  },
  {
    name: 'Suresh Pillai', role: 'Sales Manager', stage: 'Offer Sent', score: 88, avatar: 'SP',
  },
  {
    name: 'Nisha Verma', role: 'DevOps Engineer', stage: 'Screening', score: 74, avatar: 'NV',
  },
];

const ONBOARDING = [
  {
    name: 'Arjun Mehta', role: 'Finance Executive', joinDate: '01 Jan 2026', progress: 85, tasks: 6, done: 5,
  },
  {
    name: 'Kavya Menon', role: 'HR Executive', joinDate: '15 Feb 2026', progress: 100, tasks: 6, done: 6,
  },
];

const STAGE_COLOR: Record<string, string> = {
  Applied: 'bg-gray-100 text-gray-600',
  Screening: 'bg-blue-100 text-blue-700',
  Interviewing: 'bg-amber-100 text-amber-700',
  'Technical Round 2': 'bg-purple-100 text-purple-700',
  'HR Interview': 'bg-indigo-100 text-indigo-700',
  'Offer Sent': 'bg-green-100 text-green-700',
  Offer: 'bg-green-100 text-green-700',
};

export default function TalentPage() {
  const [activeTab, setActiveTab] = useState('Recruitment');

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Talent</h1>
          <p className="text-sm text-gray-500 mt-0.5">Module 2 · Recruitment, Onboarding & Lifecycle</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">Phase 2</span>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-white text-[#0f1f2e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Recruitment' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Open Positions', value: '4', color: 'text-[#2D7A4F]' },
              { label: 'Total Applicants', value: '85', color: 'text-blue-600' },
              { label: 'In Interview', value: '12', color: 'text-amber-600' },
              { label: 'Offers Sent', value: '3', color: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Job openings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Active Job Openings</h3>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Plus size={14} />
                {' '}
                Post Job
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {JOB_OPENINGS.map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-[#2D7A4F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{job.title}</p>
                    <p className="text-xs text-gray-500">
                      {job.dept}
                      {' '}
                      ·
                      {' '}
                      {job.location}
                      {' '}
                      · Posted
                      {' '}
                      {job.posted}
                    </p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-bold text-gray-800">{job.applicants}</p>
                    <p className="text-[10px] text-gray-400">applicants</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STAGE_COLOR[job.stage]}`}>{job.stage}</span>
                  <ChevronRight size={15} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Candidate pipeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Candidate Pipeline</h3>
            <div className="space-y-3">
              {CANDIDATES.map((c) => (
                <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{c.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.role}</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-bold text-[#2D7A4F]">
                      {c.score}
                      %
                    </p>
                    <p className="text-[10px] text-gray-400">match</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STAGE_COLOR[c.stage] || 'bg-gray-100 text-gray-600'}`}>{c.stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Onboarding' && (
        <div className="space-y-4">
          {ONBOARDING.map((emp) => (
            <div key={emp.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center">
                  <span className="text-white font-bold">{emp.name.split(' ').map((n) => n[0]).join('')}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#0f1f2e]">{emp.name}</h3>
                  <p className="text-xs text-gray-500">
                    {emp.role}
                    {' '}
                    · Joined
                    {' '}
                    {emp.joinDate}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${emp.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {emp.progress === 100 ? 'Complete' : `${emp.progress}%`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e]" style={{ width: `${emp.progress}%` }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Offer Accepted', 'Documents Submitted', 'IT Setup Done', 'Induction Complete', 'Manager Intro', 'System Access'].map((task, i) => (
                  <div key={task} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${i < emp.done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    <CheckCircle size={12} className={i < emp.done ? 'text-green-600' : 'text-gray-300'} />
                    {task}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Lifecycle' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Employee Lifecycle Tracking</h3>
          <div className="space-y-3">
            {[
              {
                name: 'Vikram Patel', event: 'Probation Review Due', date: '31 Mar 2026', type: 'probation',
              },
              {
                name: 'Ananya Krishnan', event: 'Confirmation Pending', date: '15 Apr 2026', type: 'confirm',
              },
              {
                name: 'Kavya Menon', event: 'Role Change Approved', date: '01 Mar 2026', type: 'change',
              },
              {
                name: 'Rohit Gupta', event: 'Exit Interview Scheduled', date: '28 Feb 2026', type: 'exit',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{item.name.split(' ').map((n) => n[0]).join('')}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.event}</p>
                </div>
                <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Action →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Performance' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Performance Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Active OKRs', value: '18', icon: '🎯', color: 'bg-blue-50',
              },
              {
                label: 'Reviews Due', value: '6', icon: '📋', color: 'bg-amber-50',
              },
              {
                label: 'Feedback Cycles', value: '2', icon: '💬', color: 'bg-purple-50',
              },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-2xl p-5 text-center`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-2xl font-black text-[#0f1f2e]">{s.value}</p>
                <p className="text-xs text-gray-600 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-sm font-semibold text-amber-800">Performance module is part of Phase 2 expansion.</p>
            <p className="text-xs text-amber-600 mt-0.5">Full OKR tracking, 360° reviews, and feedback cycles coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
