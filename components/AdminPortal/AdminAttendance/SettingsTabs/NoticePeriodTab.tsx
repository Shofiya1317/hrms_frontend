'use client';

import { useEffect, useState } from 'react';
import { Loader2, Clock, AlertCircle, Save, Check } from 'lucide-react';
import {
  getNoticePeriodPolicy,
  updateNoticePeriodPolicy,
  INoticePeriodPolicyPayload,
} from '@/lib/service/noticePeriod';

const defaultNoticePeriod: INoticePeriodPolicyPayload = {
  full_time: { notice_days: 0 },
  probation: { notice_days: 0 },
  intern: { notice_days: 0 },
  part_time: { notice_days: 0 },
  contract: { notice_days: 0 },
};

export default function NoticePeriodTab({ subdomain }: { subdomain: string }) {
  const [npForm, setNpForm] = useState<INoticePeriodPolicyPayload>(defaultNoticePeriod);
  const [npLoading, setNpLoading] = useState(false);
  const [npSaving, setNpSaving] = useState(false);
  const [npError, setNpError] = useState<string | null>(null);
  const [npSaved, setNpSaved] = useState(false);

  useEffect(() => {
    if (subdomain) {
      fetchNoticePeriod();
    }
  }, [subdomain]);

  const fetchNoticePeriod = async () => {
    setNpLoading(true);
    setNpError(null);
    try {
      const res = await getNoticePeriodPolicy(subdomain);
      const data = res?.data?.data ?? {};
      setNpForm({
        full_time: data.full_time ?? { notice_days: 0 },
        probation: data.probation ?? { notice_days: 0 },
        intern: data.intern ?? { notice_days: 0 },
        part_time: data.part_time ?? { notice_days: 0 },
        contract: data.contract ?? { notice_days: 0 },
      });
    } catch {
      setNpError('Failed to load notice period policy.');
    } finally {
      setNpLoading(false);
    }
  };

  const handleSaveNoticePeriod = async () => {
    setNpSaving(true);
    setNpError(null);
    setNpSaved(false);
    try {
      await updateNoticePeriodPolicy(npForm, subdomain);
      setNpSaved(true);
      setTimeout(() => setNpSaved(false), 2500);
    } catch (e: any) {
      setNpError(e?.response?.data?.message || 'Failed to save notice period policy.');
    } finally {
      setNpSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
          <Clock size={15} className="text-[#2D7A4F]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0f1f2e]">Notice Period Policy</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Configure notice period duration for each employment type</p>
        </div>
      </div>

      {npLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
            {[
              { key: 'full_time', label: 'Full Time' },
              { key: 'probation', label: 'Probation' },
              { key: 'intern', label: 'Intern' },
              { key: 'part_time', label: 'Part Time' },
              { key: 'contract', label: 'Contract' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={(npForm as any)[key]?.notice_days || 0}
                    onChange={(e) => setNpForm((p) => ({ ...p, [key]: { notice_days: Number(e.target.value) } }))}
                    className="w-24 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all text-center"
                  />
                  <span className="text-xs text-gray-500 w-8">days</span>
                </div>
              </div>
            ))}
          </div>

          {npError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{npError}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveNoticePeriod}
              disabled={npSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60"
            >
              {npSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {' '}
                  Saving...
                </>
              ) : npSaved ? (
                <>
                  <Check size={14} />
                  {' '}
                  Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  {' '}
                  Save Policy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
