'use client';

import { Formik, Form } from 'formik';
import { useRouter } from 'next/navigation';
import { object, array } from 'yup';
import toast from 'react-hot-toast';
import { MdArrowForward } from 'react-icons/md';
import { IoMdAdd } from 'react-icons/io';
import Select from 'react-select';
import { useEffect, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { onboardingStep2, getOnboardingStep2 } from '@/lib/service/auth';
import { MastersService } from '@/lib/service';
import { IAccount } from '@/lib/interface/IAccount.interface';
import {
  IDepartment,
  IMastersListResponse,
  IShift,
  IWorkSchedule,
} from '@/lib/interface/IMasters.interface';
import CustomStyles from '../CustomStyles/CustomStyles';
import { Button } from '../Button/Button';
import './OrganisationSetupForm.css';

// ── Form types ────────────────────────────────────────────────────

interface NewDept {
  name: string;
  description: string;
}
interface NewShift {
  name: string;
  description: string;
  start_time: string;
  end_time: string;
}
interface NewSchedule {
  name: string;
  description: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  sunday: boolean;
  saturday_week_1: boolean;
  saturday_week_2: boolean;
  saturday_week_3: boolean;
  saturday_week_4: boolean;
  saturday_week_5: boolean;
}

interface OrganisationSetup {
  branches_locations: string[];
  departments: string[];
  work_shifts: string[];
  work_schedules: string[];
}

// ── Constants ─────────────────────────────────────────────────────

const DAY_FIELDS: { key: keyof NewSchedule; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'sunday', label: 'Sunday' },
];

const SATURDAY_FIELDS: { key: keyof NewSchedule; label: string }[] = [
  { key: 'saturday_week_1', label: 'Week 1' },
  { key: 'saturday_week_2', label: 'Week 2' },
  { key: 'saturday_week_3', label: 'Week 3' },
  { key: 'saturday_week_4', label: 'Week 4' },
  { key: 'saturday_week_5', label: 'Week 5' },
];

const emptyDept: NewDept = { name: '', description: '' };
const emptyShift: NewShift = {
  name: '',
  description: '',
  start_time: '',
  end_time: '',
};
const emptySchedule: NewSchedule = {
  name: '',
  description: '',
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  sunday: false,
  saturday_week_1: false,
  saturday_week_2: false,
  saturday_week_3: false,
  saturday_week_4: false,
  saturday_week_5: false,
};

const validationSchema = object({
  branches_locations: array().min(
    1,
    'At least one branch/location is required',
  ),
  departments: array().min(1, 'At least one department is required'),
  work_shifts: array().min(1, 'At least one work shift is required'),
});

// ── Add Custom Button ─────────────────────────────────────────────

function AddCustomBtn({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#1e293b',
        background: '#f1f5f9',
        border: '1.5px dashed #94a3b8',
        borderRadius: '8px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '#e2e8f0';
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#64748b';
        (e.currentTarget as HTMLButtonElement).style.color = '#0f172a';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9';
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#94a3b8';
        (e.currentTarget as HTMLButtonElement).style.color = '#1e293b';
      }}
    >
      <IoMdAdd size={15} />
      {label}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function OrganisationSetupForm({
  slug,
  account,
}: {
  slug: string;
  account: IAccount | null;
}) {
  const router = useRouter();
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [apiShifts, setApiShifts] = useState<IShift[]>([]);
  const [apiSchedules, setApiSchedules] = useState<IWorkSchedule[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(true);

  const [savedDepartments, setSavedDepartments] = useState<string[]>([]);
  const [savedShifts, setSavedShifts] = useState<string[]>([]);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [savedSchedules, setSavedSchedules] = useState<string[]>([]);

  const [showCustomDeptModal, setShowCustomDeptModal] = useState(false);
  const [showCustomShiftModal, setShowCustomShiftModal] = useState(false);

  const [savingDept, setSavingDept] = useState(false);
  const [savingShift, setSavingShift] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [newDept, setNewDept] = useState<NewDept>(emptyDept);
  const [newShift, setNewShift] = useState<NewShift>(emptyShift);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>(emptySchedule);

  const initialValues: OrganisationSetup = {
    branches_locations: savedLocations.length ? savedLocations : [],
    departments: savedDepartments.length ? savedDepartments : (account?.department_ids || []),
    work_shifts: savedShifts.length ? savedShifts : (account?.shift_ids || []),
    work_schedules: savedSchedules.length ? savedSchedules : (account?.work_schedule_ids || []),
  };

  // ── Fetch helpers ───────────────────────────────────────────────

  const fetchDepartments = async () => {
    const res = await MastersService.getDepartments(slug);
    const data = res?.data as IMastersListResponse<IDepartment>;
    if (data?.success) setDepartments(data.data);
  };

  const fetchShifts = async () => {
    const res = await MastersService.getShifts(slug);
    const data = res?.data as IMastersListResponse<IShift>;
    if (data?.success) setApiShifts(data.data);
  };

  const fetchWorkSchedules = async () => {
    const res = await MastersService.getWorkSchedules(slug);
    const data = res?.data;
    if (Array.isArray(data)) {
      setApiSchedules(data as IWorkSchedule[]);
    } else if ((data as IMastersListResponse<IWorkSchedule>)?.success) {
      setApiSchedules((data as IMastersListResponse<IWorkSchedule>).data);
    }
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        await Promise.all([
          fetchDepartments(),
          fetchShifts(),
          fetchWorkSchedules(),
          (async () => {
            try {
              const res = await getOnboardingStep2(slug);
              const data = res?.data?.data ?? res?.data;
              if (data) {
                if (Array.isArray(data.department_ids)) setSavedDepartments(data.department_ids);
                if (Array.isArray(data.shift_ids)) setSavedShifts(data.shift_ids);
                if (Array.isArray(data.work_location_ids)) setSavedLocations(data.work_location_ids);
                if (Array.isArray(data.work_schedule_ids)) setSavedSchedules(data.work_schedule_ids);
                if (Array.isArray(data.work_location) && !data.work_location_ids) setSavedLocations(data.work_location);

                // ── Populate schedule builder from saved work_schedule object ──
                if (data.work_schedule && typeof data.work_schedule === 'object') {
                  const ws = data.work_schedule;
                  setNewSchedule({
                    name:             ws.name             ?? '',
                    description:      ws.description      ?? '',
                    monday:           ws.monday           ?? false,
                    tuesday:          ws.tuesday          ?? false,
                    wednesday:        ws.wednesday        ?? false,
                    thursday:         ws.thursday         ?? false,
                    friday:           ws.friday           ?? false,
                    sunday:           ws.sunday           ?? false,
                    saturday_week_1:  ws.saturday_week_1  ?? false,
                    saturday_week_2:  ws.saturday_week_2  ?? false,
                    saturday_week_3:  ws.saturday_week_3  ?? false,
                    saturday_week_4:  ws.saturday_week_4  ?? false,
                    saturday_week_5:  ws.saturday_week_5  ?? false,
                  });
                }
              }
            } catch { /* silent — form still works without pre-fill */ }
          })(),
        ]);
      } catch {
        toast.error('Failed to load master data');
      } finally {
        setLoadingMasters(false);
      }
    };
    fetchMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived options ─────────────────────────────────────────────

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const shiftOptions = apiShifts.map((s) => ({
    value: s.id,
    label:
      s.start_time_24hr && s.end_time_24hr
        ? `${s.name} (${s.start_time_24hr} – ${s.end_time_24hr})`
        : s.name,
  }));

  const scheduleOptions = apiSchedules.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  // ── Submit ──────────────────────────────────────────────────────

  const onSubmit = async (values: OrganisationSetup) => {
    try {
      const payload: any = {
        ...(values.branches_locations && { work_location: values.branches_locations }),
        ...(values.departments?.length && { department_ids: values.departments }),
        ...(values.work_shifts?.length && { shift_ids: values.work_shifts }),
      };

      if (newSchedule.name?.trim()) {
        payload.work_schedule = {
          name:             newSchedule.name.trim(),
          ...(newSchedule.description      && { description:      newSchedule.description }),
          ...(newSchedule.monday    !== undefined && { monday:           newSchedule.monday }),
          ...(newSchedule.tuesday   !== undefined && { tuesday:          newSchedule.tuesday }),
          ...(newSchedule.wednesday !== undefined && { wednesday:        newSchedule.wednesday }),
          ...(newSchedule.thursday  !== undefined && { thursday:         newSchedule.thursday }),
          ...(newSchedule.friday    !== undefined && { friday:           newSchedule.friday }),
          ...(newSchedule.saturday_week_1 !== undefined && { saturday_week_1: newSchedule.saturday_week_1 }),
          ...(newSchedule.saturday_week_2 !== undefined && { saturday_week_2: newSchedule.saturday_week_2 }),
          ...(newSchedule.saturday_week_3 !== undefined && { saturday_week_3: newSchedule.saturday_week_3 }),
          ...(newSchedule.saturday_week_4 !== undefined && { saturday_week_4: newSchedule.saturday_week_4 }),
          ...(newSchedule.saturday_week_5 !== undefined && { saturday_week_5: newSchedule.saturday_week_5 }),
          ...(newSchedule.sunday    !== undefined && { sunday:           newSchedule.sunday }),
        };
      }

      const res = await onboardingStep2(payload, slug);
      const { success, error } = res?.data as {
        success: boolean;
        error?: string[] | string;
      };

      if (success) {
        toast.success('Organisation setup completed successfully');
        router.push('/dashboard');
        router.refresh();
      } else {
        const errorMsg = Array.isArray(error) ? error[0] : (error ?? 'Something went wrong');
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.[0] ||
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong';
      toast.error(errorMsg);
    }
  };

  // ── Custom create handlers ──────────────────────────────────────

  const handleAddCustomDept = async () => {
    if (!newDept.name || newDept.name.trim().length < 2) {
      toast.error('Department name must be at least 2 characters');
      return;
    }
    setSavingDept(true);
    try {
      const res = await MastersService.createDepartment(
        { name: newDept.name.trim(), description: newDept.description },
        slug,
      );
      const { success, error } = res?.data as {
        success: boolean;
        error: string;
      };
      if (success) {
        await fetchDepartments();
        setNewDept(emptyDept);
        setShowCustomDeptModal(false);
        toast.success('Department created successfully');
      } else {
        toast.error(error ?? 'Failed to create department');
      }
    } catch {
      toast.error('Failed to create department');
    } finally {
      setSavingDept(false);
    }
  };

  const handleAddCustomShift = async () => {
    if (!newShift.name || newShift.name.trim().length < 3) {
      toast.error('Shift name must be at least 3 characters');
      return;
    }
    if (!newShift.start_time) {
      toast.error('Start time is required');
      return;
    }
    if (!newShift.end_time) {
      toast.error('End time is required');
      return;
    }
    setSavingShift(true);
    try {
      const res = await MastersService.createShift(
        {
          name: newShift.name.trim(),
          description: newShift.description,
          start_time: newShift.start_time,
          end_time: newShift.end_time,
        },
        slug,
      );
      const { success, error } = res?.data as {
        success: boolean;
        error: string;
      };
      if (success) {
        await fetchShifts();
        setNewShift(emptyShift);
        setShowCustomShiftModal(false);
        toast.success('Shift created successfully');
      } else {
        toast.error(error ?? 'Failed to create shift');
      }
    } catch {
      toast.error('Failed to create shift');
    } finally {
      setSavingShift(false);
    }
  };

  const handleAddCustomSchedule = async () => {
    if (!newSchedule.name || newSchedule.name.trim().length < 3) {
      toast.error('Schedule name must be at least 3 characters');
      return;
    }
    setSavingSchedule(true);
    try {
      const res = await MastersService.createWorkSchedule(
        { ...newSchedule, name: newSchedule.name.trim() },
        slug,
      );
      const { success, error } = res?.data as {
        success: boolean;
        data?: IWorkSchedule;
        error?: string;
      };
      if (success) {
        await fetchWorkSchedules();
        toast.success('Work schedule created successfully');
      } else {
        toast.error(error ?? 'Failed to create work schedule');
      }
    } catch {
      toast.error('Failed to create work schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  // ── Custom Time Picker ────────────────────────────────────────────

  function TimePickerInput({
    value,
    onChange,
    placeholder = '--:-- --',
  }: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  }) {
    const [open, setOpen] = useState(false);
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
    const ref = useRef<HTMLDivElement>(null);
    const hourRef = useRef<HTMLDivElement>(null);
    const minRef = useRef<HTMLDivElement>(null);

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const handleOpen = () => {
      if (value) {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          const p = h >= 12 ? 'PM' : 'AM';
          const h12 = h % 12 === 0 ? 12 : h % 12;
          setHour(String(h12).padStart(2, '0'));
          setMinute(String(m).padStart(2, '0'));
          setPeriod(p);
        }
      }
      setOpen((o) => !o);
    };

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
      if (!open) return;
      setTimeout(() => {
        [hourRef, minRef].forEach((r) => {
          const active = r.current?.querySelector('.tp-item--active') as HTMLElement;
          if (active && r.current) {
            r.current.scrollTop = active.offsetTop - r.current.clientHeight / 2 + active.clientHeight / 2;
          }
        });
      }, 50);
    }, [open]);

    const handleDone = () => {
      let h24 = parseInt(hour);
      if (period === 'AM' && h24 === 12) h24 = 0;
      if (period === 'PM' && h24 !== 12) h24 += 12;
      onChange(`${String(h24).padStart(2, '0')}:${minute}`);
      setOpen(false);
    };

    const displayValue = value
      ? (() => {
        const [h, m] = value.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return '';
        const p = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${p}`;
      })()
      : '';

    return (
      <div className="tp-wrapper" ref={ref}>
        <div
          className={`tp-trigger${open ? ' tp-trigger--open' : ''}`}
          onClick={handleOpen}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tp-icon">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className={displayValue ? 'tp-value' : 'tp-placeholder'}>
            {displayValue || placeholder}
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="tp-chevron">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {open && (
          <div className="tp-dropdown">
            <div className="tp-col" ref={hourRef}>
              <div className="tp-col-label">HH</div>
              {hours.map((h) => (
                <div key={h} className={`tp-item${h === hour ? ' tp-item--active' : ''}`} onClick={() => setHour(h)}>
                  {h}
                </div>
              ))}
            </div>
            <div className="tp-sep">:</div>
            <div className="tp-col" ref={minRef}>
              <div className="tp-col-label">MM</div>
              {minutes.map((m) => (
                <div key={m} className={`tp-item${m === minute ? ' tp-item--active' : ''}`} onClick={() => setMinute(m)}>
                  {m}
                </div>
              ))}
            </div>
            <div className="tp-period-col">
              <div className="tp-col-label">--</div>
              {(['AM', 'PM'] as const).map((p) => (
                <div key={p} className={`tp-period-item${p === period ? ' tp-item--active' : ''}`} onClick={() => setPeriod(p)}>
                  {p}
                </div>
              ))}
              <button type="button" className="tp-done-btn" onClick={handleDone}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────

  return (
    <>
      <div style={{margin: '0 auto' }}>

        <div className="mt-4">
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            validateOnChange={false}
            validateOnBlur={false}
            enableReinitialize
          >
            {({ handleSubmit, isSubmitting, setFieldValue, values, errors }) => (
              <Form onSubmit={handleSubmit}>
                {/* Row 1: Branches + Departments */}
                <div className="row g-3 mt-2">
                  <div className="col-12 col-md-12">
                    <label className="form-label fw-medium">
                      Branches / Locations <span className="text-danger">*</span>
                    </label>
                    <CreatableSelect
                      styles={CustomStyles(false)}
                      isMulti
                      options={[]}
                      value={values.branches_locations.map((v) => ({ value: v, label: v }))}
                      onChange={(selected: any) =>
                        setFieldValue('branches_locations', selected.map((s: any) => s.value))
                      }
                      placeholder="e.g. Chennai HQ, Mumbai Office…"
                      noOptionsMessage={() => 'Type a location and press Enter'}
                      formatCreateLabel={(input) => `Add "${input}"`}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors.branches_locations && (
                      <div className="text-danger small mt-1">{String(errors.branches_locations)}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-12">
                    <label className="form-label fw-medium">Departments</label>
                    <div className="d-flex gap-2 align-items-start">
                      <div className="flex-grow-1">
                        <Select
                          styles={CustomStyles(false)}
                          isMulti
                          isLoading={loadingMasters}
                          options={departmentOptions}
                          value={departmentOptions.filter((d) => values.departments.includes(d.value))}
                          onChange={(selected: any) =>
                            setFieldValue('departments', selected.map((s: any) => s.value))
                          }
                          placeholder={loadingMasters ? 'Loading…' : 'Select departments…'}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <AddCustomBtn label="Create dept" onClick={() => setShowCustomDeptModal(true)} />
                    </div>
                    {errors.departments && (
                      <div className="text-danger small mt-1">{String(errors.departments)}</div>
                    )}
                  </div>
                </div>

                {/* Row 2: Work Shift + Work Schedule */}
                <div className="row g-3 mt-2 mb-2">
                  <div className="col-12 col-md-12">
                    <label className="form-label fw-medium">Work Shift</label>
                    <div className="d-flex gap-2 align-items-start">
                      <div className="flex-grow-1">
                        <Select
                          styles={CustomStyles(false)}
                          isMulti
                          isLoading={loadingMasters}
                          options={shiftOptions}
                          value={shiftOptions.filter((o) => values.work_shifts.includes(o.value))}
                          onChange={(selected: any) =>
                            setFieldValue('work_shifts', selected.map((s: any) => s.value))
                          }
                          placeholder={loadingMasters ? 'Loading…' : 'Select shifts…'}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <AddCustomBtn label="Create shift" onClick={() => setShowCustomShiftModal(true)} />
                    </div>
                    {errors.work_shifts && (
                      <div className="text-danger small mt-1">{String(errors.work_shifts)}</div>
                    )}
                  </div>

                  {/* Work Schedule Visual Builder — pre-filled from GET response */}
                  <div className="col-12 col-md-12">
                    <label className="form-label fw-medium">Configure Schedule</label>
                    <div className="schedule-builder-card">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Schedule name (e.g. 5-Day Week)"
                          value={newSchedule.name}
                          onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                        />
                      </div>

                      <div className="mb-3">
                        <div className="schedule-label">Working Days</div>
                        <div className="d-flex flex-wrap gap-2">
                          {DAY_FIELDS.map(({ key, label }) => (
                            <label
                              key={key}
                              className={`day-pill${newSchedule[key] ? ' day-pill--active' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={newSchedule[key] as boolean}
                                onChange={(e) =>
                                  setNewSchedule({ ...newSchedule, [key]: e.target.checked })
                                }
                              />
                              {label.substring(0, 3)}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="schedule-label">Saturday Weeks</div>
                        <div className="d-flex flex-wrap gap-2">
                          {SATURDAY_FIELDS.map(({ key, label }) => (
                            <label
                              key={key}
                              className={`day-pill day-pill--sat${newSchedule[key] ? ' day-pill--active' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={newSchedule[key] as boolean}
                                onChange={(e) =>
                                  setNewSchedule({ ...newSchedule, [key]: e.target.checked })
                                }
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="d-flex justify-content-center mt-5 mb-3 company-information-btn-container">
                  <Button
                    text={isSubmitting ? 'Saving…' : 'Save & Proceed'}
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                    type="submit"
                    isSolid
                    className="company-info-btn"
                    sufixIconChildren={(
                      <MdArrowForward size={20} color="var(--icon-color)" className="ms-3" />
                    )}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* ── Custom Department Modal ── */}
      {showCustomDeptModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Custom Department</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowCustomDeptModal(false); setNewDept(emptyDept); }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Product Design"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  />
                </div>
                <div className="mb-1">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter a brief description"
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  text="Cancel"
                  type="button"
                  variant="outline"
                  onClick={() => { setShowCustomDeptModal(false); setNewDept(emptyDept); }}
                />
                <Button
                  text={savingDept ? 'Saving…' : 'Add Department'}
                  isDisabled={savingDept}
                  isLoading={savingDept}
                  type="button"
                  onClick={handleAddCustomDept}
                  isSolid
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Shift Modal ── */}
      {showCustomShiftModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Custom Shift</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowCustomShiftModal(false); setNewShift(emptyShift); }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Morning Shift"
                    value={newShift.name}
                    onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter description"
                    value={newShift.description}
                    onChange={(e) => setNewShift({ ...newShift, description: e.target.value })}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">Start Time</label>
                    <TimePickerInput
                      value={newShift.start_time}
                      onChange={(val) => setNewShift({ ...newShift, start_time: val })}
                      placeholder="Start time"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End Time</label>
                    <TimePickerInput
                      value={newShift.end_time}
                      onChange={(val) => setNewShift({ ...newShift, end_time: val })}
                      placeholder="End time"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  text="Cancel"
                  type="button"
                  variant="outline"
                  onClick={() => { setShowCustomShiftModal(false); setNewShift(emptyShift); }}
                />
                <Button
                  text={savingShift ? 'Saving…' : 'Add Shift'}
                  isDisabled={savingShift}
                  isLoading={savingShift}
                  type="button"
                  onClick={handleAddCustomShift}
                  isSolid
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}