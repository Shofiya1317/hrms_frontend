'use client';

import { useEffect, useState } from 'react';
import { Loader2, CalendarDays, AlertCircle, Save, Check } from 'lucide-react';
import {
  getWorkSchedule,
  updateWorkSchedule,
} from '@/lib/service/companyHoliday';
import Toggle from './Toggle';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday_week_1' | 'saturday_week_2' | 'saturday_week_3' | 'saturday_week_4' | 'saturday_week_5' | 'sunday';

interface WorkScheduleForm {
  name: string;
  description: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday_week_1: boolean;
  saturday_week_2: boolean;
  saturday_week_3: boolean;
  saturday_week_4: boolean;
  saturday_week_5: boolean;
  sunday: boolean;
}

const defaultWorkSchedule: WorkScheduleForm = {
  name: '',
  description: '',
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday_week_1: false,
  saturday_week_2: false,
  saturday_week_3: false,
  saturday_week_4: false,
  saturday_week_5: false,
  sunday: false,
};

const WEEKDAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'sunday', label: 'Sunday' },
];

const SATURDAYS: { key: DayKey; label: string }[] = [
  { key: 'saturday_week_1', label: '1st Saturday' },
  { key: 'saturday_week_2', label: '2nd Saturday' },
  { key: 'saturday_week_3', label: '3rd Saturday' },
  { key: 'saturday_week_4', label: '4th Saturday' },
  { key: 'saturday_week_5', label: '5th Saturday' },
];

export default function WorkScheduleTab({ subdomain }: { subdomain: string }) {
  const [wsForm, setWsForm] = useState<WorkScheduleForm>(defaultWorkSchedule);
  const [wsLoading, setWsLoading] = useState(false);
  const [wsSaving, setWsSaving] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsSaved, setWsSaved] = useState(false);

  useEffect(() => {
    if (subdomain) {
      fetchWorkSchedule();
    }
  }, [subdomain]);

  const fetchWorkSchedule = async () => {
    setWsLoading(true);
    setWsError(null);
    try {
      const res = await getWorkSchedule(subdomain);
      const data = res?.data?.data ?? res?.data;
      if (data?.schedule) {
        setWsForm({
          name: data.name ?? '',
          description: data.description ?? '',
          ...data.schedule,
        });
      }
    } catch {
      setWsError('Failed to load work schedule.');
    } finally {
      setWsLoading(false);
    }
  };

  const handleSaveWorkSchedule = async () => {
    setWsSaving(true);
    setWsError(null);
    setWsSaved(false);
    try {
      await updateWorkSchedule(wsForm, subdomain);
      setWsSaved(true);
      setTimeout(() => setWsSaved(false), 2500);
    } catch (e: any) {
      setWsError(e?.response?.data?.message || 'Failed to save work schedule.');
    } finally {
      setWsSaving(false);
    }
  };

  const toggleWsDay = (key: DayKey) => setWsForm((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
          <CalendarDays size={15} className="text-[#2D7A4F]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0f1f2e]">Work Schedule</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Define which days are working days</p>
        </div>
      </div>

      {wsLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : (
        <div className="p-4 space-y-5">
          {/* Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Schedule Name</label>
              <input
                type="text"
                value={wsForm.name}
                onChange={(e) => setWsForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Standard 5-Day Week"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <input
                type="text"
                value={wsForm.description}
                onChange={(e) => setWsForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Monday to Friday working days"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              />
            </div>
          </div>

          {/* Weekdays */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-700">Weekdays</p>
            <div className="space-y-4">
              {WEEKDAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{wsForm[key] ? 'Working' : 'Off'}</span>
                    <Toggle checked={!!wsForm[key]} onChange={() => toggleWsDay(key)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saturdays */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-700">Saturdays</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SATURDAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{wsForm[key] ? 'Working' : 'Off'}</span>
                    <Toggle checked={!!wsForm[key]} onChange={() => toggleWsDay(key)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary badges */}
          {(wsForm.monday || wsForm.tuesday || wsForm.wednesday || wsForm.thursday || wsForm.friday
            || wsForm.saturday_week_1 || wsForm.saturday_week_2 || wsForm.saturday_week_3
            || wsForm.saturday_week_4 || wsForm.saturday_week_5 || wsForm.sunday) && (
            <div className="rounded-xl border border-[#e8f5ee] bg-[#f6fcf9] p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-[#2D7A4F] uppercase tracking-wide">Working Days</p>
              <div className="flex flex-wrap gap-1.5">
                {[...WEEKDAYS, ...SATURDAYS]
                  .filter(({ key }) => wsForm[key])
                  .map(({ key, label }) => (
                    <span key={key} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f5ee] text-[#2D7A4F]">{label}</span>
                  ))}
              </div>
            </div>
          )}

          {wsError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{wsError}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveWorkSchedule}
              disabled={wsSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60"
            >
              {wsSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {' '}
                  Saving...
                </>
              ) : wsSaved ? (
                <>
                  <Check size={14} />
                  {' '}
                  Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  {' '}
                  Save Schedule
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
