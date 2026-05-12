/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-array-index-key */

'use client';

import {
  useEffect, useState, forwardRef, useCallback,
} from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { VendorService, TaskService } from '@/lib/service';
import {
  Formik, Form, FieldArray, FormikHelpers,
} from 'formik';
import Select, { SingleValue } from 'react-select';
import { Trash2, X, Calendar } from 'lucide-react';
import { FaArrowRight } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { Button } from '../Button/Button';
import CustomStyles from '../CustomStyles/CustomStyles';
import './TaskAssignForm.css';
import DateField from '../ResponseInputFields/DateField';

type YearInputProps = {
  value?: string;
  onClick?: () => void;
};

const YearInput = forwardRef<HTMLButtonElement, YearInputProps>(
  ({ value, onClick }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="w-full h-10 px-3 !border !border-[#ACACAC] rounded-md text-sm flex items-center justify-between bg-white focus:outline-none"
    >
      <span className={value ? 'text-gray-900' : 'text-gray-400'}>
        {value || 'Select Financial Year'}
      </span>
      <Calendar size={16} className="text-gray-400" />
    </button>
  ),
);

YearInput.displayName = 'YearInput';

/* -------------------- Types -------------------- */

type OptionType = {
  label: string;
  value: string;
};

type AssignmentFormValue = {
  sku: OptionType | null;
  standard: OptionType | null;
  dueDate: string;
};

type AssignFormValues = {
  assignments: AssignmentFormValue[];
  financial_year: string;
};

type ValidAssignment = {
  sku: OptionType;
  standard: OptionType;
  dueDate: string;
};

type CreateTaskPayload = {
  due_date: string;
  product_id: string;
  vendor_id: string;
  admin_standard_id: string;
};

type Props = {
  apiKey?: string;
  token?: string;
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
};

/* -------------------- Component -------------------- */

export default function AssignFormModal({
  apiKey,
  token,
  isOpen,
  onClose,
  vendorId,
}: Props) {
  const params = useParams();
  const slug = params?.subdomain as string;

  const [skuOptions, setSkuOptions] = useState<OptionType[]>([]);
  const [standardOptions, setStandardOptions] = useState<OptionType[]>([]);

  /* -------------------- Effects -------------------- */

  useEffect(() => {
    if (!vendorId || !slug) return;

    const fetchSkus = async () => {
      try {
        const response = await VendorService.getVendorById(slug, vendorId);

        if (response?.data?.success && response.data.vendor?.product_vendors) {
          const options: OptionType[] = response.data.vendor.product_vendors.map(
            (pv: {
                product: {
                  id: string;
                  product_code: string;
                  product_name: string;
                };
              }) => ({
              value: pv.product.id,
              label: `${pv.product.product_code} - ${pv.product.product_name}`,
            }),
          );

          setSkuOptions(options);
        } else {
          setSkuOptions([]);
        }
      } catch (error) {
        setSkuOptions([]);
      }
    };

    fetchSkus();
  }, [vendorId, slug]);

  const fetchStandards = useCallback(async () => {
    try {
      const response = await TaskService.getAdminStandards(apiKey, token);
      const standards = response?.data ?? [];

      if (!Array.isArray(standards)) {
        setStandardOptions([]);
        return;
      }

      const options: OptionType[] = standards.map(
        (std: { id: string; name: string }) => ({
          value: std.id,
          label: std.name,
        }),
      );

      setStandardOptions(options);
    } catch {
      setStandardOptions([]);
    }
  }, [apiKey, token]);

  useEffect(() => {
    fetchStandards();
  }, [fetchStandards]);

  /* -------------------- Submit -------------------- */

  const handleSubmit = async (
    values: AssignFormValues,
    { setSubmitting }: FormikHelpers<AssignFormValues>,
  ) => {
    setSubmitting(true);

    try {
      const tasks: CreateTaskPayload[] = values.assignments
        .filter((a): a is ValidAssignment => Boolean(a.sku && a.standard && a.dueDate))
        .map((a) => ({
          due_date: a.dueDate,
          product_id: a.sku.value,
          vendor_id: vendorId,
          admin_standard_id: a.standard.value,
        }));

      if (!tasks.length) {
        toast.error('No valid tasks to assign');
        return;
      }

      const response = await TaskService.createTask(
        tasks,
        values.financial_year,
        slug,
        token,
      );

      if (response?.data?.success) {
        toast.success('Tasks assigned successfully!');
        onClose();
      } else {
        toast.error(response?.data?.error?.[0]);
      }
    } catch (error) {
      toast.error('Failed to assign tasks. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------- Form -------------------- */

  const initialValues: AssignFormValues = {
    financial_year: '',
    assignments: [
      {
        sku: null,
        standard: null,
        dueDate: '',
      },
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md h-[75vh] rounded-lg p-4 overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={22} strokeWidth={3} />
        </button>

        <h2 className="text-xl text-center font-semibold mt-1 mb-3">
          Assign Tasks
        </h2>

        <Formik<AssignFormValues>
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {(
            { values, setFieldValue, isSubmitting }, // ✅ Added isSubmitting here
          ) => (
            <Form className="space-y-4">
              <div className="mt-3 w-full px-4">
                <label className="text-sm font-medium mb-2 block">
                  Financial Year
                </label>

                <DatePicker
                  wrapperClassName="w-full"
                  selected={
                    values.financial_year
                      ? new Date(Number(values.financial_year), 0)
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (!date) return;
                    setFieldValue('financial_year', String(date.getFullYear()));
                  }}
                  showYearPicker
                  dateFormat="yyyy"
                  customInput={<YearInput value={values.financial_year} />}
                />
              </div>

              <FieldArray name="assignments">
                {({ push, remove }) => (
                  <>
                    {values.assignments.map((_, index) => (
                      <div
                        key={index}
                        className="bg-[#FAFAFAB2] border border-[#E4E7EC] rounded-md p-3"
                      >
                        {/* SKU */}
                        <div className="mt-1">
                          <label className="text-sm font-medium mb-1 block">
                            SKU
                          </label>
                          <Select
                            styles={CustomStyles(true)}
                            options={skuOptions}
                            value={values.assignments[index].sku}
                            onChange={(option: SingleValue<OptionType>) => setFieldValue(`assignments.${index}.sku`, option)}
                            placeholder="Choose SKU"
                          />
                        </div>

                        {/* Standard */}
                        <div className="mt-3">
                          <label className="text-sm font-medium mb-1 block">
                            Standard
                          </label>
                          <Select
                            styles={CustomStyles(true)}
                            options={standardOptions}
                            value={values.assignments[index].standard}
                            onChange={(option: SingleValue<OptionType>) => setFieldValue(
                              `assignments.${index}.standard`,
                              option,
                            )}
                            placeholder="Choose Standard"
                          />
                        </div>

                        {/* Due Date */}
                        <div className="mt-3 mb-2">
                          <label className="text-sm font-medium mb-1 block">
                            Due Date
                          </label>
                          <DateField
                            name={`assignments.${index}.dueDate`}
                            value={values.assignments[index].dueDate}
                            onChange={(val: string) => setFieldValue(`assignments.${index}.dueDate`, val)}
                            placeholder="Select due date"
                          />
                        </div>

                        {values.assignments.length > 1 && (
                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="flex items-center gap-1 text-[#DD4014]"
                            >
                              <Trash2 size={18} />
                              <span className="text-sm mt-1">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => push({ sku: null, standard: null, dueDate: '' })}
                        className="flex items-center gap-1 text-sm text-[#FBA900] font-medium"
                      >
                        <IoMdAdd size={18} />
                        Add More
                      </button>
                    </div>
                  </>
                )}
              </FieldArray>

              <div className="pt-3 w-full px-5">
                <Button
                  type="submit"
                  text={isSubmitting ? 'Assigning...' : 'Assign Now'}
                  isSolid
                  isDisabled={isSubmitting}
                  sufixIconChildren={
                    isSubmitting ? (
                      <div
                        className="spinner-border spinner-border-sm ms-2"
                        role="status"
                        style={{ color: '#FBA900', width: 16, height: 16 }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <FaArrowRight
                        size={20}
                        className="ml-2"
                        color="#FBA900"
                      />
                    )
                  }
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
