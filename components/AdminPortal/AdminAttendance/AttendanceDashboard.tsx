'use client';

import { Download, TrendingUp, TrendingDown, Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const weeklyData = [
  { day: 'Mon', present: 142, absent: 18, late: 8 },
  { day: 'Tue', present: 148, absent: 12, late: 5 },
  { day: 'Wed', present: 151, absent: 9, late: 3 },
  { day: 'Thu', present: 145, absent: 15, late: 7 },
  { day: 'Fri', present: 138, absent: 22, late: 11 },
  { day: 'Sat', present: 62, absent: 8, late: 2 },
];

const STAT_CARDS = [
  {
    label: 'Present Today',
    value: '213',
    sub: '85.9% attendance rate',
    icon: Users,
    bgCls: 'bg-emerald-50',
    iconCls: 'text-emerald-600',
  },
  {
    label: 'Absent',
    value: '18',
    sub: '7.3% of workforce',
    icon: Calendar,
    bgCls: 'bg-red-50',
    iconCls: 'text-red-500',
  },
  {
    label: 'Late Arrivals',
    value: '9',
    sub: 'Before 10 AM only',
    icon: Clock,
    bgCls: 'bg-amber-50',
    iconCls: 'text-amber-600',
  },
  {
    label: 'On Leave',
    value: '8',
    sub: 'Approved leaves',
    icon: AlertCircle,
    bgCls: 'bg-blue-50',
    iconCls: 'text-blue-600',
  },
];

export default function AttendanceDashboard() {
  return (
    <div className="min-h-screen">
      <div className="space-y-4 sm:space-y-5 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-xl font-bold text-slate-900">Attendance Overview</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Live tracking & management</p>
          </div>
        </div>

        {/* Stats Cards - Redesigned */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map(card => (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                {/* Left side - Stats */}
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    {card.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {card.sub}
                  </p>
                </div>
                
                {/* Right side - Icon */}
                <div className={`w-8 h-8 rounded-lg ${card.bgCls} flex items-center justify-center flex-shrink-0`}>
                  <card.icon size={16} className={card.iconCls} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Attendance Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Calendar size={14} className="text-teal-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Weekly Attendance Trend
                  </h3>
                </div>
                <p className="text-xs text-slate-400 ml-8">
                  Present vs Absent vs Late · This week
                </p>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
                  Present
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  Absent
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-400" />
                  Late
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData} barSize={24} barGap={4} margin={{ top: 8, right: 8, left: -24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 10, 
                    border: '1px solid #e2e8f0', 
                    background: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 12,
                    padding: '8px 12px'
                  }} 
                />
                <Bar dataKey="present" fill="#0f766e" radius={[6, 6, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#fbbf24" radius={[6, 6, 0, 0]} name="Absent" />
                <Bar dataKey="late" fill="#fb923c" radius={[6, 6, 0, 0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}