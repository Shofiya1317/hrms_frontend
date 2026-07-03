'use client';

import { useEffect, useState } from 'react';
import { Loader2, Clock, AlertCircle, Save, Check, Edit2, X } from 'lucide-react';
import {
  getNoticePeriodPolicy,
  updateNoticePeriodPolicy,
  INoticePeriodPolicyPayload,
  INoticePeriodConfig
} from '@/lib/service/noticePeriod';
import { getLeaveTypes } from '@/lib/service/leave';

const defaultNoticePeriod: INoticePeriodPolicyPayload = {
  full_time: { notice_days: 0 },
  probation: { notice_days: 0 },
  intern: { notice_days: 0 },
  // part_time: { notice_days: 0 },
  // contract: { notice_days: 0 },
};

const EMP_TYPES = [
  { key: 'full_time', label: 'Full Time' },
  { key: 'probation', label: 'Probation' },
  { key: 'intern', label: 'Intern' },
  // { key: 'part_time', label: 'Part Time' },
  // { key: 'contract', label: 'Contract' },
];

export default function NoticePeriodTab({ subdomain }: { subdomain: string }) {
  const [npForm, setNpForm] = useState<INoticePeriodPolicyPayload>(defaultNoticePeriod);
  const [npLoading, setNpLoading] = useState(false);
  const [npSaving, setNpSaving] = useState(false);
  const [npError, setNpError] = useState<string | null>(null);
  const [npSaved, setNpSaved] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const [activeModalEmp, setActiveModalEmp] = useState<string | null>(null);

  useEffect(() => {
    if (subdomain) {
      fetchData();
    }
  }, [subdomain]);

  const fetchData = async () => {
    setNpLoading(true);
    setNpError(null);
    try {
      const [npRes, leaveRes] = await Promise.all([
        getNoticePeriodPolicy(subdomain),
        getLeaveTypes(subdomain)
      ]);
      const data = npRes?.data?.data ?? {};
      setNpForm({
        full_time: data.full_time ?? { notice_days: 0 },
        probation: data.probation ?? { notice_days: 0 },
        intern: data.intern ?? { notice_days: 0 },
        // part_time: data.part_time ?? { notice_days: 0 },
        // contract: data.contract ?? { notice_days: 0 },
      });
      setLeaveTypes(leaveRes?.data?.data || []);
    } catch {
      setNpError('Failed to load data.');
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
          <Clock size={18} className="text-[#2D7A4F]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0f1f2e]">Notice Period Policy</h2>
          <p className="text-xs text-gray-400 mt-0.5">Configure notice period duration & rules for each employment type</p>
        </div>
      </div>

      {npLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#0f766e]" />
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMP_TYPES.map(({ key, label }) => {
              const config = (npForm as any)[key] as INoticePeriodConfig;
              return (
                <div key={key} className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 hover:border-[#0f766e]/30 transition-colors flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">{label}</span>
                    <button 
                      onClick={() => setActiveModalEmp(key)}
                      className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition-all hover:text-[#0f766e]"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><span className="font-medium text-gray-700">Notice Days:</span> {config?.notice_days || 0} days</p>
                    <p><span className="font-medium text-gray-700">Leave Allowed:</span> {config?.allow_leave_during_notice ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium text-gray-700">Leave Encashment:</span> {config?.leave_encashment_on_exit ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {npError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{npError}</p>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-gray-100 mt-4">
            <button
              onClick={handleSaveNoticePeriod}
              disabled={npSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60 shadow-sm"
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

      {/* Modal */}
      {activeModalEmp && (
        <ConfigModal 
          empTypeKey={activeModalEmp}
          empTypeLabel={EMP_TYPES.find(e => e.key === activeModalEmp)?.label || ''}
          config={(npForm as any)[activeModalEmp] || {}}
          leaveTypes={leaveTypes}
          onClose={() => setActiveModalEmp(null)}
          onSave={(newConfig) => {
            setNpForm(prev => ({ ...prev, [activeModalEmp]: newConfig }));
            setActiveModalEmp(null);
          }}
        />
      )}
    </div>
  );
}

function ConfigModal({ 
  empTypeKey, 
  empTypeLabel, 
  config, 
  leaveTypes,
  onClose, 
  onSave 
}: { 
  empTypeKey: string,
  empTypeLabel: string,
  config: INoticePeriodConfig,
  leaveTypes: any[],
  onClose: () => void,
  onSave: (c: INoticePeriodConfig) => void
}) {
  const [localConfig, setLocalConfig] = useState<INoticePeriodConfig>({
    notice_days: config?.notice_days || 0,
    allow_leave_during_notice: !!config?.allow_leave_during_notice,
    allowed_leave_type_ids: config?.allowed_leave_type_ids || [],
    if_not_allowed_action: config?.if_not_allowed_action || 'reject',
    extend_notice_by_leave_days: !!config?.extend_notice_by_leave_days,
    leave_encashment_on_exit: !!config?.leave_encashment_on_exit,
    eligible_leave_types_for_encashment: config?.eligible_leave_types_for_encashment || []
  });

  const toggleLeaveType = (id: string, field: 'allowed_leave_type_ids' | 'eligible_leave_types_for_encashment') => {
    setLocalConfig(prev => {
      const arr = prev[field] || [];
      const newArr = arr.includes(id) ? arr.filter((x: string) => x !== id) : [...arr, id];
      return { ...prev, [field]: newArr };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{empTypeLabel} Notice Period</h3>
            <p className="text-xs text-gray-500">Configure detailed rules for this employment type</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Notice Days */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Notice Period Duration (Days)</label>
            <input 
              type="number"
              min={0}
              value={localConfig.notice_days}
              onChange={(e) => setLocalConfig(p => ({ ...p, notice_days: Number(e.target.value) }))}
              className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            />
          </div>

          {/* Leave During Notice */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Allow Leave During Notice</label>
                <p className="text-xs text-gray-500 mt-0.5">Can employees take leave while on notice period?</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={localConfig.allow_leave_during_notice} onChange={(e) => setLocalConfig(p => ({ ...p, allow_leave_during_notice: e.target.checked }))} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f766e]"></div>
              </label>
            </div>

            {localConfig.allow_leave_during_notice ? (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Allowed Leave Types</label>
                  <p className="text-xs text-gray-500 mb-3">Select which leaves can be applied</p>
                  <div className="flex flex-wrap gap-2">
                    {leaveTypes.map(lt => {
                      const selected = localConfig.allowed_leave_type_ids?.includes(lt.id);
                      return (
                        <button
                          key={lt.id}
                          onClick={() => toggleLeaveType(lt.id, 'allowed_leave_type_ids')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selected ? 'bg-[#0f766e] border-[#0f766e] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#0f766e]/50'}`}
                        >
                          {lt.name}
                        </button>
                      );
                    })}
                    {leaveTypes.length === 0 && <span className="text-xs text-gray-400 italic">No leave types found</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Action if Leave Requested</label>
                  <select 
                    value={localConfig.if_not_allowed_action}
                    onChange={(e) => setLocalConfig(p => ({ ...p, if_not_allowed_action: e.target.value as 'reject' | 'lop' }))}
                    className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] bg-white text-sm"
                  >
                    <option value="reject">Auto Reject Leave Request</option>
                    <option value="lop">Treat as Loss of Pay (LOP)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <label className="text-sm font-semibold text-gray-700">Extend Notice Period By Leave Days</label>
              <p className="text-xs text-gray-500 mt-0.5">If employee takes leave, notice period end date extends</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={localConfig.extend_notice_by_leave_days} onChange={(e) => setLocalConfig(p => ({ ...p, extend_notice_by_leave_days: e.target.checked }))} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f766e]"></div>
            </label>
          </div>

          {/* Leave Encashment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Leave Encashment on Exit</label>
                <p className="text-xs text-gray-500 mt-0.5">Allow encashment of unused leave balance upon resignation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={localConfig.leave_encashment_on_exit} onChange={(e) => setLocalConfig(p => ({ ...p, leave_encashment_on_exit: e.target.checked }))} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f766e]"></div>
              </label>
            </div>

            {localConfig.leave_encashment_on_exit && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Eligible Leave Types For Encashment</label>
                  <p className="text-xs text-gray-500 mb-3">Select which leaves can be encashed</p>
                  <div className="flex flex-wrap gap-2">
                    {leaveTypes.map(lt => {
                      const selected = localConfig.eligible_leave_types_for_encashment?.includes(lt.id);
                      return (
                        <button
                          key={lt.id}
                          onClick={() => toggleLeaveType(lt.id, 'eligible_leave_types_for_encashment')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selected ? 'bg-[#0f766e] border-[#0f766e] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#0f766e]/50'}`}
                        >
                          {lt.name}
                        </button>
                      );
                    })}
                    {leaveTypes.length === 0 && <span className="text-xs text-gray-400 italic">No leave types found</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex justify-end gap-3 z-10">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(localConfig)}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors"
          >
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
}
