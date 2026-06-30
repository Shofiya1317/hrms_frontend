'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, AlertCircle, Save, Check } from 'lucide-react';
import {
  getWorkLocationSchedule,
  updateWorkLocationSchedule,
} from '@/lib/service/companyHoliday';

type LocationDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
type WorkLocationForm = Record<LocationDayKey, 'office' | 'wfh'>;

const defaultWorkLocation: WorkLocationForm = {
  monday: 'office',
  tuesday: 'office',
  wednesday: 'office',
  thursday: 'office',
  friday: 'office',
  saturday: 'office',
};

const LOCATION_DAYS: { key: LocationDayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
];

export default function WorkLocationTab({ subdomain }: { subdomain: string }) {
  const [wlForm, setWlForm] = useState<WorkLocationForm>(defaultWorkLocation);
  const [wlLoading, setWlLoading] = useState(false);
  const [wlSaving, setWlSaving] = useState(false);
  const [wlError, setWlError] = useState<string | null>(null);
  const [wlSaved, setWlSaved] = useState(false);

  useEffect(() => {
    if (subdomain) {
      fetchWorkLocation();
    }
  }, [subdomain]);

  const fetchWorkLocation = async () => {
    setWlLoading(true);
    setWlError(null);
    try {
      const res = await getWorkLocationSchedule(subdomain);
      const schedule = res?.data?.data?.schedule ?? res?.data?.schedule;
      if (schedule) {
        setWlForm({
          monday: schedule.monday ?? 'office',
          tuesday: schedule.tuesday ?? 'office',
          wednesday: schedule.wednesday ?? 'office',
          thursday: schedule.thursday ?? 'office',
          friday: schedule.friday ?? 'office',
          saturday: schedule.saturday ?? 'office',
        });
      }
    } catch {
      setWlError('Failed to load work location schedule.');
    } finally {
      setWlLoading(false);
    }
  };

  const handleSaveWorkLocation = async () => {
    setWlSaving(true);
    setWlError(null);
    setWlSaved(false);
    try {
      await updateWorkLocationSchedule(wlForm, subdomain);
      setWlSaved(true);
      setTimeout(() => setWlSaved(false), 2500);
    } catch (e: any) {
      setWlError(e?.response?.data?.message || 'Failed to save work location schedule.');
    } finally {
      setWlSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
          <MapPin size={15} className="text-[#2D7A4F]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0f1f2e]">Work Location Schedule</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Set office or WFH for each day of the week</p>
        </div>
      </div>

      {wlLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
            {LOCATION_DAYS.map(({ key, label }) => {
              const isOffice = wlForm[key] === 'office';
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setWlForm((p) => ({ ...p, [key]: 'office' }))}
                        className={`px-3 py-1.5 transition-colors ${isOffice ? 'bg-[#0f766e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        Office
                      </button>
                      <button
                        type="button"
                        onClick={() => setWlForm((p) => ({ ...p, [key]: 'wfh' }))}
                        className={`px-3 py-1.5 transition-colors ${!isOffice ? 'bg-[#0f766e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        WFH
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            {(['office', 'wfh'] as const).map((type) => {
              const days = LOCATION_DAYS.filter(({ key }) => wlForm[key] === type).map((d) => d.label);
              return (
                <div key={type} className={`rounded-xl p-3 border ${type === 'office' ? 'bg-[#f6fcf9] border-[#e8f5ee]' : 'bg-blue-50 border-blue-100'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${type === 'office' ? 'text-[#2D7A4F]' : 'text-blue-600'}`}>
                    {type === 'office' ? '🏢 Office' : '🏠 WFH'}
                  </p>
                  {days.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {days.map((d) => (
                        <span key={d} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${type === 'office' ? 'bg-[#e8f5ee] text-[#2D7A4F]' : 'bg-blue-100 text-blue-600'}`}>{d}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">None</p>
                  )}
                </div>
              );
            })}
          </div>

          {wlError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{wlError}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveWorkLocation}
              disabled={wlSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60"
            >
              {wlSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {' '}
                  Saving...
                </>
              ) : wlSaved ? (
                <>
                  <Check size={14} />
                  {' '}
                  Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  {' '}
                  Save Location
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
