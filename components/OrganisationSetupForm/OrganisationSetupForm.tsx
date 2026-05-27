'use client';

import { Formik, Form } from 'formik';
import { useRouter } from 'next/navigation';
import { object, array } from 'yup';
import { Button } from '../Button/Button';
import toast from 'react-hot-toast';
import { MdArrowForward } from 'react-icons/md';
import { IoMdAdd } from 'react-icons/io';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import CustomStyles from '../CustomStyles/CustomStyles';
import { onboardingStep2 } from '@/lib/service/auth';
import { MastersService } from '@/lib/service';
import { IDepartment, IMastersListResponse, IShift, IWorkSchedule } from '@/lib/interface/IMasters.interface';

// ── Form types ────────────────────────────────────────────────────

interface NewDept { name: string; description: string }
interface NewShift { name: string; description: string; start_time: string; end_time: string; working_hours: number | '' }
interface NewSchedule {
  name: string; description: string;
  monday: boolean; tuesday: boolean; wednesday: boolean; thursday: boolean;
  friday: boolean; sunday: boolean;
  saturday_week_1: boolean; saturday_week_2: boolean; saturday_week_3: boolean;
  saturday_week_4: boolean; saturday_week_5: boolean;
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
const emptyShift: NewShift = { name: '', description: '', start_time: '', end_time: '', working_hours: '' };
const emptySchedule: NewSchedule = {
  name: '', description: '',
  monday: false, tuesday: false, wednesday: false, thursday: false,
  friday: false, sunday: false,
  saturday_week_1: false, saturday_week_2: false, saturday_week_3: false,
  saturday_week_4: false, saturday_week_5: false,
};

const validationSchema = object({
  branches_locations: array().min(1, 'At least one branch/location is required'),
  departments: array().min(1, 'At least one department is required'),
  work_shifts: array().min(1, 'At least one work shift is required'),
  work_schedules: array().min(1, 'At least one work schedule is required'),
});

const initialValues: OrganisationSetup = {
  branches_locations: [],
  departments: [],
  work_shifts: [],
  work_schedules: [],
};

// ── Add Custom Button ─────────────────────────────────────────────

function AddCustomBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', fontSize: '13px', fontWeight: 500,
        color: '#1e293b', background: '#f1f5f9',
        border: '1.5px dashed #94a3b8', borderRadius: '8px',
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 0.15s ease', flexShrink: 0,
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

export default function OrganisationSetupForm({ slug }: { slug: string }) {
  const router = useRouter();

  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [apiShifts, setApiShifts] = useState<IShift[]>([]);
  const [apiSchedules, setApiSchedules] = useState<IWorkSchedule[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(true);

  const [showCustomDeptModal, setShowCustomDeptModal] = useState(false);
  const [showCustomShiftModal, setShowCustomShiftModal] = useState(false);
  const [showCustomScheduleModal, setShowCustomScheduleModal] = useState(false);

  const [savingDept, setSavingDept] = useState(false);
  const [savingShift, setSavingShift] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [newDept, setNewDept] = useState<NewDept>(emptyDept);
  const [newShift, setNewShift] = useState<NewShift>(emptyShift);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>(emptySchedule);

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
    // GET /v1/masters/work-schedules returns a plain array, not { success, data, meta }
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
        await Promise.all([fetchDepartments(), fetchShifts(), fetchWorkSchedules()]);
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

  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

  const shiftOptions = apiShifts.map((s) => ({
    value: s.id,
    label: s.start_time_24hr && s.end_time_24hr
      ? `${s.name} (${s.start_time_24hr} – ${s.end_time_24hr})`
      : s.name,
  }));

  const scheduleOptions = apiSchedules.map((s) => ({ value: s.id, label: s.name }));

  // ── Submit ──────────────────────────────────────────────────────

  const onSubmit = async (values: OrganisationSetup) => {
    try {
      const payload = {
        work_location_ids: values.branches_locations,
        department_ids: values.departments,
        shift_ids: values.work_shifts,
        work_schedule_ids: values.work_schedules,
      };
      const res = await onboardingStep2(payload, slug);
      const { success, error } = res?.data as { success: boolean; error: string[] };
      if (success) {
        toast.success('Organisation setup completed successfully');
        router.push('/company_profile/invite_user');
        router.refresh();
      } else {
        toast.error(Array.isArray(error) ? error[0] : error ?? 'Something went wrong');
      }
    } catch {
      toast.error('Something went wrong');
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
      const { success, error } = res?.data as { success: boolean; error: string };
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
    if (!newShift.start_time) { toast.error('Start time is required'); return; }
    if (!newShift.end_time) { toast.error('End time is required'); return; }
    if (!newShift.working_hours) { toast.error('Working hours is required'); return; }
    setSavingShift(true);
    try {
      const res = await MastersService.createShift(
        {
          name: newShift.name.trim(),
          description: newShift.description,
          start_time: newShift.start_time,
          end_time: newShift.end_time,
          working_hours: newShift.working_hours,
        },
        slug,
      );
      const { success, error } = res?.data as { success: boolean; error: string };
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
      const { success, error } = res?.data as { success: boolean; data?: IWorkSchedule; error?: string };
      if (success) {
        await fetchWorkSchedules();
        setNewSchedule(emptySchedule);
        setShowCustomScheduleModal(false);
        toast.success('Work schedule created successfully');
      } else {
        toast.error(error ?? 'Failed to create work schedule');
      }
      toast.error('Failed to create work schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <>
      <div style={{ width: '680px', maxWidth: '95%', margin: '0 auto' }}>
        <div className="text-center mb-4 company-profile-header">
          <h5 className="page-title">Set Up Your Organisation</h5>
          <span className="page-subtitle">
            Configure your workspace structure before getting started
          </span>
        </div>

        <div className="mt-4">
          <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
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
                    <label className="form-label fw-medium">
                      Departments <span className="text-danger">*</span>
                    </label>
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
                      <AddCustomBtn label="Custom" onClick={() => setShowCustomDeptModal(true)} />
                    </div>
                    {errors.departments && (
                      <div className="text-danger small mt-1">{String(errors.departments)}</div>
                    )}
                  </div>
                </div>

                {/* Row 2: Work Shift + Work Schedule */}
                <div className="row g-3 mt-2 mb-2">
                  <div className="col-12 col-md-12">
                    <label className="form-label fw-medium">
                      Work Shift <span className="text-danger">*</span>
                    </label>
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
                      <AddCustomBtn label="Custom" onClick={() => setShowCustomShiftModal(true)} />
                    </div>
                    {errors.work_shifts && (
                      <div className="text-danger small mt-1">{String(errors.work_shifts)}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-12">
                    <label className="form-label fw-medium">
                      Work Schedule <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-2 align-items-start">
                      <div className="flex-grow-1">
                        <Select
                          styles={CustomStyles(false)}
                          isMulti
                          isLoading={loadingMasters}
                          options={scheduleOptions}
                          value={scheduleOptions.filter((o) => values.work_schedules.includes(o.value))}
                          onChange={(selected: any) =>
                            setFieldValue('work_schedules', selected.map((s: any) => s.value))
                          }
                          placeholder={loadingMasters ? 'Loading…' : 'Select schedules…'}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <AddCustomBtn label="Custom" onClick={() => setShowCustomScheduleModal(true)} />
                    </div>
                    {errors.work_schedules && (
                      <div className="text-danger small mt-1">{String(errors.work_schedules)}</div>
                    )}
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
                    sufixIconChildren={
                      <MdArrowForward size={20} color="var(--icon-color)" className="ms-3" />
                    }
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
                <button type="button" className="btn-close"
                  onClick={() => { setShowCustomDeptModal(false); setNewDept(emptyDept); }} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="e.g. Product Design"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} />
                </div>
                <div className="mb-1">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Enter a brief description"
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <Button text="Cancel" type="button" variant="outline"
                  onClick={() => { setShowCustomDeptModal(false); setNewDept(emptyDept); }} />
                <Button text={savingDept ? 'Saving…' : 'Add Department'}
                  isDisabled={savingDept} isLoading={savingDept}
                  type="button" onClick={handleAddCustomDept} isSolid />
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
                <button type="button" className="btn-close"
                  onClick={() => { setShowCustomShiftModal(false); setNewShift(emptyShift); }} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="e.g. Morning Shift"
                    value={newShift.name}
                    onChange={(e) => setNewShift({ ...newShift, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} placeholder="Enter description"
                    value={newShift.description}
                    onChange={(e) => setNewShift({ ...newShift, description: e.target.value })} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">Start Time <span className="text-danger">*</span></label>
                    <input type="time" className="form-control" value={newShift.start_time}
                      onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End Time <span className="text-danger">*</span></label>
                    <input type="time" className="form-control" value={newShift.end_time}
                      onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })} />
                  </div>
                </div>
                <div className="mb-1">
                  <label className="form-label">Working Hours <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" min={1} max={24} placeholder="e.g. 8"
                    value={newShift.working_hours}
                    onChange={(e) =>
                      setNewShift({ ...newShift, working_hours: e.target.value ? parseInt(e.target.value) : '' })
                    } />
                </div>
              </div>
              <div className="modal-footer">
                <Button text="Cancel" type="button" variant="outline"
                  onClick={() => { setShowCustomShiftModal(false); setNewShift(emptyShift); }} />
                <Button text={savingShift ? 'Saving…' : 'Add Shift'}
                  isDisabled={savingShift} isLoading={savingShift}
                  type="button" onClick={handleAddCustomShift} isSolid />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Schedule Modal ── */}
      {showCustomScheduleModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Custom Schedule</h5>
                <button type="button" className="btn-close"
                  onClick={() => { setShowCustomScheduleModal(false); setNewSchedule(emptySchedule); }} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="e.g. 5-Day Week"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} placeholder="Enter description"
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Working Days</label>
                  <div className="d-flex flex-wrap gap-3">
                    {DAY_FIELDS.map(({ key, label }) => (
                      <div className="form-check" key={key}>
                        <input className="form-check-input" type="checkbox" id={`day_${key}`}
                          checked={newSchedule[key] as boolean}
                          onChange={(e) => setNewSchedule({ ...newSchedule, [key]: e.target.checked })} />
                        <label className="form-check-label" htmlFor={`day_${key}`}>{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-1">
                  <label className="form-label fw-semibold">Saturday Working Weeks</label>
                  <div className="d-flex flex-wrap gap-3">
                    {SATURDAY_FIELDS.map(({ key, label }) => (
                      <div className="form-check" key={key}>
                        <input className="form-check-input" type="checkbox" id={`sat_${key}`}
                          checked={newSchedule[key] as boolean}
                          onChange={(e) => setNewSchedule({ ...newSchedule, [key]: e.target.checked })} />
                        <label className="form-check-label" htmlFor={`sat_${key}`}>{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button text="Cancel" type="button" variant="outline"
                  onClick={() => { setShowCustomScheduleModal(false); setNewSchedule(emptySchedule); }} />
                <Button text={savingSchedule ? 'Saving…' : 'Add Schedule'}
                  isDisabled={savingSchedule} isLoading={savingSchedule}
                  type="button" onClick={handleAddCustomSchedule} isSolid />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
