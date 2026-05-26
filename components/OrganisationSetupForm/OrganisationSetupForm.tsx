'use client';

import { Formik, Form } from 'formik';
import { useRouter } from 'next/navigation';
import { object, array, string } from 'yup';
import { Button } from '../Button/Button';
import toast from 'react-hot-toast';
import { MdArrowForward } from 'react-icons/md';
import { IoMdAdd } from 'react-icons/io';
import Select from 'react-select';
import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import CustomStyles from '../CustomStyles/CustomStyles';
import { onboardingStep2 } from '@/lib/service/auth';

interface CustomShift {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  working_hours: number | '';
}

interface CustomSchedule {
  id: string;
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

interface OrganisationSetup {
  branches_locations: string[];
  departments: string[];
  work_shift: string;
  work_schedule: string;
}

const predefinedShiftOptions = [
  { value: 'morning', label: 'Morning Shift (9 AM – 6 PM)' },
  { value: 'night', label: 'Night Shift (10 PM – 7 AM)' },
  { value: 'rotating', label: 'Rotating Shift' },
  { value: 'flexible', label: 'Flexible Shift' },
];

const predefinedScheduleOptions = [
  { value: 'full_time', label: 'Full Time (5 days/week)' },
  { value: 'part_time', label: 'Part Time (3 days/week)' },
  { value: 'hybrid', label: 'Hybrid Schedule' },
  { value: 'remote', label: 'Remote Schedule' },
];

const commonDepartments = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'product', label: 'Product' },
];

const DAY_FIELDS: { key: keyof CustomSchedule; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'sunday', label: 'Sunday' },
];

const SATURDAY_FIELDS: { key: keyof CustomSchedule; label: string }[] = [
  { key: 'saturday_week_1', label: 'Week 1' },
  { key: 'saturday_week_2', label: 'Week 2' },
  { key: 'saturday_week_3', label: 'Week 3' },
  { key: 'saturday_week_4', label: 'Week 4' },
  { key: 'saturday_week_5', label: 'Week 5' },
];

const emptyShift: Partial<CustomShift> = {
  name: '',
  description: '',
  start_time: '',
  end_time: '',
  working_hours: '',
};

const emptySchedule: Partial<CustomSchedule> = {
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

export default function OrganisationSetupForm({ slug }: { slug: string }) {
  const router = useRouter();

  const [showCustomShiftModal, setShowCustomShiftModal] = useState(false);
  const [showCustomScheduleModal, setShowCustomScheduleModal] = useState(false);
  const [customShifts, setCustomShifts] = useState<CustomShift[]>([]);
  const [customSchedules, setCustomSchedules] = useState<CustomSchedule[]>([]);
  const [newShift, setNewShift] = useState<Partial<CustomShift>>(emptyShift);
  const [newSchedule, setNewSchedule] =
    useState<Partial<CustomSchedule>>(emptySchedule);

  const validationSchema = object({
    branches_locations: array().min(
      1,
      'At least one branch/location is required'
    ),
    departments: array().min(1, 'At least one department is required'),
    work_shift: string().required('Work shift is required'),
    work_schedule: string().required('Work schedule is required'),
  });

  const initialValues: OrganisationSetup = {
    branches_locations: [],
    departments: [],
    work_shift: '',
    work_schedule: '',
  };

  const onSubmit = async (values: OrganisationSetup) => {
    try {
      const payload = {
        work_location_ids: values.branches_locations,
        department_ids: values.departments,
        shift_ids: values.work_shift ? [values.work_shift] : [],
        work_schedule_ids: values.work_schedule ? [values.work_schedule] : [],
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

  const handleAddCustomShift = () => {
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
    if (!newShift.working_hours) {
      toast.error('Working hours is required');
      return;
    }

    const shift: CustomShift = {
      id: `custom_shift_${Date.now()}`,
      name: newShift.name.trim(),
      description: newShift.description || '',
      start_time: newShift.start_time,
      end_time: newShift.end_time,
      working_hours: newShift.working_hours,
    };

    setCustomShifts([...customShifts, shift]);
    setNewShift(emptyShift);
    setShowCustomShiftModal(false);
    toast.success('Custom shift added');
  };

  const handleAddCustomSchedule = () => {
    if (!newSchedule.name || newSchedule.name.trim().length < 3) {
      toast.error('Schedule name must be at least 3 characters');
      return;
    }

    const schedule: CustomSchedule = {
      id: `custom_schedule_${Date.now()}`,
      name: newSchedule.name.trim(),
      description: newSchedule.description || '',
      monday: newSchedule.monday || false,
      tuesday: newSchedule.tuesday || false,
      wednesday: newSchedule.wednesday || false,
      thursday: newSchedule.thursday || false,
      friday: newSchedule.friday || false,
      sunday: newSchedule.sunday || false,
      saturday_week_1: newSchedule.saturday_week_1 || false,
      saturday_week_2: newSchedule.saturday_week_2 || false,
      saturday_week_3: newSchedule.saturday_week_3 || false,
      saturday_week_4: newSchedule.saturday_week_4 || false,
      saturday_week_5: newSchedule.saturday_week_5 || false,
    };

    setCustomSchedules([...customSchedules, schedule]);
    setNewSchedule(emptySchedule);
    setShowCustomScheduleModal(false);
    toast.success('Custom schedule added');
  };

  const getAllShiftOptions = () => [
    ...predefinedShiftOptions,
    ...customShifts.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.start_time} – ${s.end_time})`,
    })),
  ];

  const getAllScheduleOptions = () => [
    ...predefinedScheduleOptions,
    ...customSchedules.map((s) => ({
      value: s.id,
      label: s.name,
    })),
  ];

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
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            {({
              handleSubmit,
              isSubmitting,
              setFieldValue,
              values,
              errors,
            }) => (
              <Form onSubmit={handleSubmit}>
                {/* Row 1: Branches + Departments */}
                <div className="row g-3 mt-2">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">
                      Branches / Locations{' '}
                      <span className="text-danger">*</span>
                    </label>
                    <CreatableSelect
                      styles={CustomStyles(false)}
                      isMulti
                      options={[]}
                      value={(values.branches_locations as string[]).map(
                        (v) => ({
                          value: v,
                          label: v,
                        })
                      )}
                      onChange={(selected: any) => {
                        setFieldValue(
                          'branches_locations',
                          selected.map((s: any) => s.value)
                        );
                      }}
                      placeholder="e.g. Chennai HQ, Mumbai Office…"
                      noOptionsMessage={() => 'Type a location and press Enter'}
                      formatCreateLabel={(input) => `Add "${input}"`}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors.branches_locations && (
                      <div className="text-danger small mt-1">
                        {String(errors.branches_locations)}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">
                      Departments <span className="text-danger">*</span>
                    </label>
                    <CreatableSelect
                      styles={CustomStyles(false)}
                      isMulti
                      options={commonDepartments}
                      value={commonDepartments
                        .filter((d) =>
                          (values.departments as string[]).includes(d.value)
                        )
                        .concat(
                          (values.departments as string[])
                            .filter(
                              (v) =>
                                !commonDepartments.find((d) => d.value === v)
                            )
                            .map((v) => ({ value: v, label: v }))
                        )}
                      onChange={(selected: any) => {
                        setFieldValue(
                          'departments',
                          selected.map((s: any) => s.value)
                        );
                      }}
                      placeholder="Select or create departments…"
                      formatCreateLabel={(input) => `Create "${input}"`}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors.departments && (
                      <div className="text-danger small mt-1">
                        {String(errors.departments)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Work Shift + Work Schedule */}
                <div className="row g-3 mt-4 mb-2">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">
                      Work Shift <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-2 align-items-start">
                      <div className="flex-grow-1">
                        <Select
                          styles={CustomStyles(false)}
                          options={getAllShiftOptions()}
                          value={
                            getAllShiftOptions().find(
                              (o) => o.value === values.work_shift
                            ) || null
                          }
                          onChange={(option: any) =>
                            setFieldValue('work_shift', option?.value || '')
                          }
                          placeholder="Select shift…"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <Button
                        text="Custom"
                        type="button"
                        isSolid
                        className='custom-btn'
                        onClick={() => setShowCustomShiftModal(true)}
                        prefixIconChildren={
                          <IoMdAdd size={20} color="var(--icon-color)" />
                        }
                      />
                    </div>
                    {errors.work_shift && (
                      <div className="text-danger small mt-1">
                        {errors.work_shift}
                      </div>
                    )}
                    {customShifts.length > 0 && (
                      <small className="text-muted d-block mt-1">
                        {customShifts.length} custom shift
                        {customShifts.length > 1 ? 's' : ''} added
                      </small>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">
                      Work Schedule <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-2 align-items-start">
                      <div className="flex-grow-1">
                        <Select
                          styles={CustomStyles(false)}
                          options={getAllScheduleOptions()}
                          value={
                            getAllScheduleOptions().find(
                              (o) => o.value === values.work_schedule
                            ) || null
                          }
                          onChange={(option: any) =>
                            setFieldValue('work_schedule', option?.value || '')
                          }
                          placeholder="Select schedule…"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <Button
                        text="Custom"
                        type="button"
                        isSolid
                        className='custom-btn'
                        onClick={() => setShowCustomScheduleModal(true)}
                        prefixIconChildren={
                          <IoMdAdd size={20} color="var(--icon-color)" />
                        }
                      />
                    </div>
                    {errors.work_schedule && (
                      <div className="text-danger small mt-1">
                        {errors.work_schedule}
                      </div>
                    )}
                    {customSchedules.length > 0 && (
                      <small className="text-muted d-block mt-1">
                        {customSchedules.length} custom schedule
                        {customSchedules.length > 1 ? 's' : ''} added
                      </small>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="d-flex justify-content-center mt-5 company-information-btn-container">
                  <Button
                    text={isSubmitting ? 'Saving…' : 'Save & Proceed'}
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                    type="submit"
                    isSolid
                    className="company-info-btn"
                    sufixIconChildren={
                      <MdArrowForward
                        size={20}
                        color="var(--icon-color)"
                        className="ms-3"
                      />
                    }
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* ── Custom Shift Modal ── */}
      {showCustomShiftModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Custom Shift</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCustomShiftModal(false);
                    setNewShift(emptyShift);
                  }}
                />
              </div>
              <div className="modal-body">
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Morning Shift"
                    value={newShift.name || ''}
                    onChange={(e) =>
                      setNewShift({ ...newShift, name: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter description"
                    value={newShift.description || ''}
                    onChange={(e) =>
                      setNewShift({ ...newShift, description: e.target.value })
                    }
                  />
                </div>

                {/* Start Time + End Time */}
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">
                      Start Time <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={newShift.start_time || ''}
                      onChange={(e) =>
                        setNewShift({ ...newShift, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">
                      End Time <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={newShift.end_time || ''}
                      onChange={(e) =>
                        setNewShift({ ...newShift, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mb-1">
                  <label className="form-label">
                    Working Hours <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={24}
                    placeholder="e.g. 8"
                    value={newShift.working_hours || ''}
                    onChange={(e) =>
                      setNewShift({
                        ...newShift,
                        working_hours: e.target.value ? parseInt(e.target.value) : '',
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  text="Cancel"
                  type="button"
                  onClick={() => {
                    setShowCustomShiftModal(false);
                    setNewShift(emptyShift);
                  }}
                  variant="outline"
                />
                <Button
                  text="Add Shift"
                  type="button"
                  onClick={handleAddCustomShift}
                  isSolid
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Schedule Modal ── */}
      {showCustomScheduleModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Custom Schedule</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCustomScheduleModal(false);
                    setNewSchedule(emptySchedule);
                  }}
                />
              </div>
              <div className="modal-body">
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5-Day Week"
                    value={newSchedule.name || ''}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, name: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter description"
                    value={newSchedule.description || ''}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Working Days */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Working Days</label>
                  <div className="d-flex flex-wrap gap-3">
                    {DAY_FIELDS.map(({ key, label }) => (
                      <div className="form-check" key={key}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`day_${key}`}
                          checked={!!newSchedule[key]}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              [key]: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`day_${key}`}
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saturday Working Weeks */}
                <div className="mb-1">
                  <label className="form-label fw-semibold">
                    Saturday Working Weeks
                  </label>
                  <div className="d-flex flex-wrap gap-3">
                    {SATURDAY_FIELDS.map(({ key, label }) => (
                      <div className="form-check" key={key}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`sat_${key}`}
                          checked={!!newSchedule[key]}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              [key]: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`sat_${key}`}
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  text="Cancel"
                  type="button"
                  onClick={() => {
                    setShowCustomScheduleModal(false);
                    setNewSchedule(emptySchedule);
                  }}
                  variant="outline"
                />
                <Button
                  text="Add Schedule"
                  type="button"
                  onClick={handleAddCustomSchedule}
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