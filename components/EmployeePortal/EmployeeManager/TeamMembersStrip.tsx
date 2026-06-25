'use client';

import React, { useRef } from 'react';
import { ITeamMember } from '@/lib/service/employee';
import { Mail, CalendarDays, BadgeCheck } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Props {
  team: ITeamMember[];
  loading?: boolean;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const AVATAR_PALETTES = [
  ['#0f766e', '#134e4a'],
  ['#1d4ed8', '#1e3a8a'],
  ['#7c3aed', '#4c1d95'],
  ['#be185d', '#831843'],
  ['#b45309', '#78350f'],
  ['#0e7490', '#164e63'],
  ['#15803d', '#14532d'],
  ['#9333ea', '#581c87'],
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function initials(firstName?: string, lastName?: string, fullName?: string): string {
  if (fullName) {
    const parts = fullName.split(' ').filter(Boolean);
    return parts.map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '??';
  }
  return ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || '??';
}

function capitalize(str?: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function fullName(member: ITeamMember): string {
  if (member.first_name || member.last_name) {
    return `${capitalize(member.first_name)} ${capitalize(member.last_name)}`.trim();
  }
  return member.employee_name ?? '';
}

function paletteFor(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[h] as [string, string];
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─────────────────────────────────────────────
// Story Bubble
// ─────────────────────────────────────────────

function StoryBubble({ member, index }: { member: ITeamMember; index: number }) {
  const name = fullName(member);
  const [bg, bg2] = paletteFor(name || member.employee_code || String(index));
  const isActive = member.employment_status === 'ACTIVE' || member.user_status === 'ACTIVE';

  return (
    <div className="group relative flex flex-col items-center gap-1 flex-shrink-0 w-[72px]">
      {/* Story ring + avatar */}
      <div className="relative">
        {/* Gradient ring */}
        <div
          className="w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-110"
          // style={{
          //   background: 'conic-gradient(#0f766e 0%, #14b8a6 40%, #6ee7b7 70%, #0f766e 100%)',
          // }}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-950 flex items-center justify-center p-[2px]">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white text-[13px] font-semibold tracking-wide select-none"
                style={{ background: `linear-gradient(135deg, ${bg}, ${bg2})` }}
              >
                {initials(member.first_name, member.last_name, name)}
              </div>
            )}
          </div>
        </div>

        {/* Active status dot */}
        {isActive && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-950" />
        )}
      </div>

      {/* Name + code */}
      <span className="text-[11px] text-gray-700 dark:text-gray-300 text-center w-full truncate leading-tight font-medium px-0.5">
        {name || member.employee_code}
      </span>
      <span className="text-[10px] text-gray-400 text-center -mt-1">{member.employee_code}</span>

      {/* Tooltip on hover */}
      <div
        className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-20 w-48
          opacity-0 scale-95 pointer-events-none
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-150 origin-bottom"
      >
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg p-3">
          {/* Mini avatar row */}
          <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-gray-100 dark:border-gray-800">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${bg}, ${bg2})` }}
              >
                {initials(member.first_name, member.last_name, name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</p>
              <p className="text-[10px] text-gray-400">{member.employee_code}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            {member.work_email && (
              <div className="flex items-start gap-1.5">
                <Mail size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-gray-500 break-all leading-tight">{member.work_email}</span>
              </div>
            )}
            {member.date_of_joining && (
              <div className="flex items-center gap-1.5">
                <CalendarDays size={11} className="text-gray-400 flex-shrink-0" />
                <span className="text-[10px] text-gray-500">
                  Joined
                  {fmtDate(member.date_of_joining)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <BadgeCheck size={11} className={isActive ? 'text-emerald-500' : 'text-gray-300'} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {member.employment_status ?? member.user_status ?? 'Unknown'}
              </span>
            </div>
          </div>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-gray-900 border-r border-b border-gray-100 dark:border-gray-800" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────

function StorySkeletons() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px]">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-2.5 w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-2 w-7 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function TeamMembersStrip({ team, loading = false }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!loading && team.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team</p>
        {!loading && (
          <span className="text-[11px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {team.length}
            {' '}
            member
            {team.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading ? <StorySkeletons /> : team.map((m, i) => (
          <StoryBubble key={m.id ?? i} member={m} index={i} />
        ))}
      </div>
    </div>
  );
}
