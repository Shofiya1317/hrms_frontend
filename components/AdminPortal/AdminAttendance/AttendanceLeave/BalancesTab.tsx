'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  getEmployeeLeaveBalances,
  IEmployeeLeaveBalance,
  ILeaveTypeBalance,
} from '@/lib/service/employeeLeaveBalance';

// ── palette cycling for leave types ──────────────────────────────────────────
const PALETTES = [
  {
    stroke: '#0f766e', track: '#e8f5ee', bg: 'bg-[#e8f5ee]', text: 'text-[#0f766e]', badge: 'bg-[#e8f5ee] text-[#0f766e]',
  },
  {
    stroke: '#3b82f6', track: '#eff6ff', bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-600',
  },
  {
    stroke: '#f59e0b', track: '#fffbeb', bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-600',
  },
  {
    stroke: '#8b5cf6', track: '#f5f3ff', bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-50 text-purple-600',
  },
  {
    stroke: '#ec4899', track: '#fdf2f8', bg: 'bg-pink-50', text: 'text-pink-600', badge: 'bg-pink-50 text-pink-600',
  },
  {
    stroke: '#06b6d4', track: '#ecfeff', bg: 'bg-cyan-50', text: 'text-cyan-600', badge: 'bg-cyan-50 text-cyan-600',
  },
];

const AVATAR_COLORS = [
  'bg-[#0f766e]', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2)
    .toUpperCase();
}

// ── Circular progress ring ────────────────────────────────────────────────────
function CircleRing({
  pct, stroke, track, size = 56, strokeWidth = 5, children,
}: {
  pct: number; stroke: string; track: string;
  size?: number; strokeWidth?: number; children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />
        {/* fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ── Single leave-type card ────────────────────────────────────────────────────
function LeaveCard({ lt, palette }: { lt: ILeaveTypeBalance; palette: typeof PALETTES[0] }) {
  const pct = lt.total_leave > 0 ? Math.round((lt.remaining_leave / lt.total_leave) * 100) : 0;
  const usedPct = lt.total_leave > 0 ? Math.round((lt.used_leave / lt.total_leave) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-3">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#0f1f2e] leading-tight truncate">{lt.leave_type_name}</p>
          <p className={`text-[12px] font-semibold mt-0.5 ${palette.text}`}>
            {lt.total_leave}
            {' '}
            days total
          </p>
        </div>
        <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${palette.badge}`}>
          {pct}
          % left
        </span>
      </div>

      {/* ring + stats */}
      <div className="flex items-center gap-4">
        <CircleRing pct={pct} stroke={palette.stroke} track={palette.track} size={60} strokeWidth={5}>
          <span className={`text-[11px] font-bold ${palette.text}`}>{lt.remaining_leave}</span>
        </CircleRing>

        <div className="flex-1 space-y-1.5">
          {/* remaining */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Remaining</span>
            <span className={`text-[12px] font-bold ${palette.text}`}>{lt.remaining_leave}</span>
          </div>
          {/* used */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Used</span>
            <span className="text-[12px] font-bold text-gray-600">{lt.used_leave}</span>
          </div>
          {/* mini bar */}
          <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${usedPct}%`, backgroundColor: palette.stroke }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {usedPct}
            % used
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Employee row ──────────────────────────────────────────────────────────────
function EmployeeRow({ emp, idx }: { emp: IEmployeeLeaveBalance; idx: number }) {
  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const totalAlloted = emp.leave_types.reduce((s, l) => s + l.total_leave, 0);
  const totalRemaining = emp.leave_types.reduce((s, l) => s + l.remaining_leave, 0);
  const overallPct = totalAlloted > 0 ? Math.round((totalRemaining / totalAlloted) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* employee header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-gray-50/60 to-white">
        <div className={`w-9 h-9 rounded-xl ${avatarColor} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
          {initials(emp.employee_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0f1f2e] truncate">{emp.employee_name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {emp.total_leave_used}
            {' '}
            days used ·
            {totalRemaining}
            {' '}
            remaining
          </p>
        </div>
        {/* overall mini ring */}
        <CircleRing
          pct={overallPct}
          stroke="#0f766e"
          track="#e8f5ee"
          size={40}
          strokeWidth={4}
        >
          <span className="text-[8px] font-bold text-[#0f766e]">
            {overallPct}
            %
          </span>
        </CircleRing>
      </div>

      {/* leave type cards */}
      <div className={`grid gap-3 p-4 ${
        emp.leave_types.length === 1 ? 'grid-cols-1'
          : emp.leave_types.length === 2 ? 'grid-cols-2'
            : 'grid-cols-2 sm:grid-cols-3'
      }`}
      >
        {emp.leave_types.map((lt, i) => (
          <LeaveCard key={lt.leave_type_id} lt={lt} palette={PALETTES[i % PALETTES.length]} />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export default function BalancesTab() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [balances, setBalances] = useState<IEmployeeLeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (subdomain) fetchBalances();
  }, [subdomain, year]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const res = await getEmployeeLeaveBalances(subdomain, { year });
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setBalances(raw);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const filtered = useMemo(() => balances.filter((e) => e.employee_name?.toLowerCase().includes(search.toLowerCase())), [balances, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const allTypes: ILeaveTypeBalance[] = balances.flatMap((e) => e.leave_types);
    return {
      employees: balances.length,
      totalAlloted: allTypes.reduce((s, l) => s + l.total_leave, 0),
      totalUsed: allTypes.reduce((s, l) => s + l.used_leave, 0),
      totalRemaining: allTypes.reduce((s, l) => s + l.remaining_leave, 0),
    };
  }, [balances]);

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#0f1f2e]">Leave Balances</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.employees}
            {' '}
            employees ·
            {year}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* year nav */}
          <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5">
            <button onClick={() => { setYear((y) => y - 1); setPage(1); }} className="p-1 rounded-lg hover:bg-white transition-colors text-gray-500">
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs font-bold text-[#0f1f2e] px-1 min-w-[36px] text-center">{year}</span>
            <button onClick={() => { setYear((y) => y + 1); setPage(1); }} className="p-1 rounded-lg hover:bg-white transition-colors text-gray-500">
              <ChevronRight size={13} />
            </button>
          </div>
          {/* search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search employee..."
              className="pl-7 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-44"
            />
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Employees', value: stats.employees, color: 'text-[#0f766e]', bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]',
          },
          {
            label: 'Allotted', value: stats.totalAlloted, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500',
          },
          {
            label: 'Used', value: stats.totalUsed, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500',
          },
          {
            label: 'Remaining', value: stats.totalRemaining, color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            </div>
            <div>
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[12px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm font-semibold text-gray-400">No employees found</p>
          {search && <p className="text-xs text-gray-400 mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((emp, i) => (
            <EmployeeRow key={emp.employee_id} emp={emp} idx={(page - 1) * PAGE_SIZE + i} />
          ))}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] text-gray-400">
                Showing
                {' '}
                {(page - 1) * PAGE_SIZE + 1}
                –
                {Math.min(page * PAGE_SIZE, filtered.length)}
                {' '}
                of
                {' '}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-colors ${
                      p === page ? 'bg-[#0f766e] text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
