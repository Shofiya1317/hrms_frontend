/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { IAccount } from '@/lib/interface/IAccount.interface';
import { AuthService } from '@/lib/service';
import { Field, FieldProps, Form, Formik, FormikHelpers } from 'formik';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdArrowForward, MdOutlineEdit } from 'react-icons/md';
import Select from 'react-select';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { array, object, string } from 'yup';
import { Button } from '../Button/Button';
import { useUser } from '../Context/userProvider';
import { FormikField } from '../FormikField/FormikField';
import { FormikPhoneNumber } from '../FormikPhoneNumber/FormikPhoneNumber';
import { CustomInputField } from '../InputField/CustomInputField';
import { Option } from '../types';
import CustomStyles from '../CustomStyles/CustomStyles';
import './CompanyInformationForm.css';

// Import from country-state-city
import { Country, State, City } from 'country-state-city';

interface CompanyInformation {
  company_name: string;
  industry: string;
  company_size: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  address: string;
  official_email_id: string;
  sectors: string[];
  company_website_url: string;
  phone_number: string;
  tax_id: string;
  standards: string[];
  time_frame: string;
}

// Options for select fields
const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5001+', label: '5001+ employees' },
];

const timezoneOptions = [
  { value: 'UTC-12:00', label: '(UTC-12:00) International Date Line West' },
  { value: 'UTC-11:00', label: '(UTC-11:00) Coordinated Universal Time-11' },
  { value: 'UTC-10:00', label: '(UTC-10:00) Hawaii' },
  { value: 'UTC-09:00', label: '(UTC-09:00) Alaska' },
  { value: 'UTC-08:00', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'UTC-07:00', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'UTC-06:00', label: '(UTC-06:00) Central Time (US & Canada)' },
  { value: 'UTC-05:00', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'UTC-04:00', label: '(UTC-04:00) Atlantic Time (Canada)' },
  { value: 'UTC-03:00', label: '(UTC-03:00) Buenos Aires' },
  { value: 'UTC-02:00', label: '(UTC-02:00) Mid-Atlantic' },
  { value: 'UTC-01:00', label: '(UTC-01:00) Azores' },
  { value: 'UTC+00:00', label: '(UTC+00:00) London, Dublin' },
  { value: 'UTC+01:00', label: '(UTC+01:00) Berlin, Rome, Paris' },
  { value: 'UTC+02:00', label: '(UTC+02:00) Helsinki, Cairo' },
  { value: 'UTC+03:00', label: '(UTC+03:00) Moscow, Nairobi' },
  { value: 'UTC+04:00', label: '(UTC+04:00) Dubai, Baku' },
  { value: 'UTC+05:00', label: '(UTC+05:00) Islamabad, Karachi' },
  { value: 'UTC+05:30', label: '(UTC+05:30) Mumbai, Delhi' },
  { value: 'UTC+06:00', label: '(UTC+06:00) Dhaka' },
  { value: 'UTC+07:00', label: '(UTC+07:00) Bangkok, Jakarta' },
  { value: 'UTC+08:00', label: '(UTC+08:00) Singapore, Beijing' },
  { value: 'UTC+09:00', label: '(UTC+09:00) Tokyo, Seoul' },
  { value: 'UTC+10:00', label: '(UTC+10:00) Sydney, Melbourne' },
  { value: 'UTC+11:00', label: '(UTC+11:00) Solomon Islands' },
  { value: 'UTC+12:00', label: '(UTC+12:00) Auckland, Wellington' },
];

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education', label: 'Education' },
  { value: 'construction', label: 'Construction' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'hospitality', label: 'Hospitality & Tourism' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const handleCompanyProfileSubmit = async (
  values: CompanyInformation,
  slug: string,
  {
    setSubmitting,
    validateForm,
    setFieldError,
  }: FormikHelpers<CompanyInformation>,
  router: AppRouterInstance,
  isSettings: boolean
) => {
  if (
    values?.phone_number?.length > 0 &&
    !isValidPhoneNumber(values?.phone_number)
  ) {
    setFieldError('phone_number', 'Must be valid Phone Number');
  } else {
    validateForm(values);

    const apiPayload: any = {
      company_name: values.company_name,
      official_email_id: values.official_email_id,
      company_website_url: values.company_website_url,
      phone_number: values.phone_number,
      tax_id: values.tax_id,
      address: values.address,
      industries: values.industry ? [values.industry] : [],
      sectors: values.sectors,
      standards: values.standards,
      company_size: values.company_size,
      country: values.country,
      state: values.state,
      city: values.city,
      timezone: values.timezone,
    };

    if (!apiPayload.phone_number) delete apiPayload.phone_number;
    if (!apiPayload.tax_id) delete apiPayload.tax_id;
    if (!apiPayload.official_email_id) delete apiPayload.official_email_id;
    if (!apiPayload.company_website_url) delete apiPayload.company_website_url;

    setSubmitting(true);
    const res = await AuthService.companyInformation(apiPayload, slug, {
      onboarding: !isSettings,
    });
    const { success, error } = res?.data as {
      error: string[];
      success: boolean;
    };
    if (success) {
      toast.success('Company Information Registered');
      if (!isSettings) {
        router.push('/company_profile/organisation_setup');
      }
      router.refresh();
    } else {
      toast.error(error[0]);
    }
    setSubmitting(false);
  }
};

export default function CompanyInformationForm({
  token,
  slug,
  account,
}: Readonly<{ token?: string; slug: string; account?: IAccount | null }>) {
  const context = useUser();
  const { isMobileOnly } = useDeviceDetection();
  const pathname = usePathname();
  const router = useRouter();
  const isSettings = pathname?.startsWith('/settings');

  // State for location options
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [cityOptions, setCityOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (!context?.currentRole) {
      context?.getCurrentRoleAccess();
    }
    // Load countries
    const countries = Country.getAllCountries().map((country: any) => ({
      value: country.isoCode,
      label: country.name
    }));
    setCountryOptions(countries);
  }, []);

  const hasAccess = context?.currentRole?.ORGANIZATION?.includes('UPDATE');

  const validationSchema = object({
    company_name: string()
      .required('Company name is required')
      .min(2, 'Minimum 2 characters required')
      .max(50, 'Do not more than 50 characters'),
    industry: string().required('Industry selection is required'),
    company_size: string().required('Company size is required'),
    country: string().required('Country is required'),
    state: string().required('State is required'),
    city: string().required('City is required'),
    timezone: string().required('Timezone is required'),
    address: string().required('Address is required'),
    official_email_id: string()
      .email('Invalid email address')
      .matches(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
      .nullable(),
    company_website_url: string()
      .matches(
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9\-_/]*)?$/,
        'Enter a valid website URL'
      )
      .nullable(),
    phone_number: string().nullable(),
    tax_id: string()
      .nullable()
      .test(
        'tax-id-format',
        'Invalid Tax ID format',
        (value) =>
          !value || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value)
      ),
    sectors: array().nullable(),
    standards: array().nullable(),
    time_frame: string().nullable(),
  });

  const onSubmit = async (
    values: CompanyInformation,
    formikHelpers: FormikHelpers<CompanyInformation>
  ) => {
    if (
      values?.phone_number?.length > 0 &&
      !isValidPhoneNumber(values?.phone_number)
    ) {
      formikHelpers.setFieldError('phone_number', 'Must be valid Phone Number');
      return;
    }

    await handleCompanyProfileSubmit(
      values,
      slug,
      formikHelpers,
      router,
      isSettings
    );
  };

  const initialValues: CompanyInformation = {
    company_name: account?.account_name ?? '',
    industry: (account as any)?.industry ?? '',
    company_size: (account as any)?.company_size ?? '',
    country: (account as any)?.country ?? '',
    state: (account as any)?.state ?? '',
    city: (account as any)?.city ?? '',
    timezone: (account as any)?.timezone ?? '',
    address: account?.address ?? '',
    official_email_id: account?.official_email_id ?? '',
    sectors: account?.sectors || [],
    company_website_url: account?.website_url ?? '',
    phone_number: account?.phone_number ?? '',
    tax_id: account?.tax_id ?? '',
    standards: ['BRSR'],
    time_frame: 'quarter',
  };

  const className = () => {
    if (isMobileOnly) {
      return { width: '290px' };
    }
    if (isSettings) {
      return { width: '100%' };
    }
    return { width: '700px' };
  };

  const getSelectedOption = (value: string, options: Option[]) => {
    return options.find((option) => option.label === value) || null;
  };

  return (
    <div style={className()}>
      {isSettings ? (
        ''
      ) : (
        <div className="text-center mb-4 company-profile-header mb-4">
          <h5 className="page-title">Enter your Company Details</h5>
          <span className="page-subtitle">
            Please provide your company information
          </span>
        </div>
      )}
      <div className="mt-5">
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize
        >
          {({
            errors,
            handleSubmit,
            isSubmitting,
            values,
            setFieldValue,
            resetForm,
            dirty,
          }) => (
            <Form onSubmit={handleSubmit}>
              {/* Row 1: Company Name & Industry */}
              <div className="row mt-0">
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <FormikField
                      name="company_name"
                      label="Company Name"
                      placeholder="Enter your company name"
                      type="text"
                      validationSchema={validationSchema}
                      errors={errors}
                      icon={isSettings ? <MdOutlineEdit /> : ''}
                      rightIcon={!!isSettings}
                      disabled={!hasAccess}
                    />
                  </div>
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <CustomInputField
                      validationSchema={validationSchema}
                      label="Industry"
                      field={{
                        name: 'industry',
                        value: values.industry,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('industry', e.target.value);
                        },
                      }}
                      error={errors.industry as string}
                      isSideBySide={!!isSettings}
                      placeholder="Select industry type"
                    >
                      <Select
                        name="industry"
                        options={industryOptions}
                        value={getSelectedOption(values.industry, industryOptions)}
                        onChange={(option: Option | null) => {
                          setFieldValue('industry', option?.value || '');
                        }}
                        isDisabled={!hasAccess}
                        placeholder="Select industry..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        styles={CustomStyles(false)}
                      />
                    </CustomInputField>
                  </div>
                </div>
              </div>

              {/* Row 2: Company Size & Timezone */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <CustomInputField
                      validationSchema={validationSchema}
                      label="Company Size"
                      field={{
                        name: 'company_size',
                        value: values.company_size,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('company_size', e.target.value);
                        },
                      }}
                      error={errors.company_size as string}
                      isSideBySide={!!isSettings}
                      placeholder="Select company size"
                    >
                      <Select
                        name="company_size"
                        options={companySizeOptions}
                        value={getSelectedOption(values.company_size, companySizeOptions)}
                        onChange={(option: Option | null) => {
                          setFieldValue('company_size', option?.value || '');
                        }}
                        isDisabled={!hasAccess}
                        placeholder="Select company size..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        styles={CustomStyles(false)}
                      />
                    </CustomInputField>
                  </div>
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <CustomInputField
                      validationSchema={validationSchema}
                      label="Timezone"
                      field={{
                        name: 'timezone',
                        value: values.timezone,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('timezone', e.target.value);
                        },
                      }}
                      error={errors.timezone as string}
                      isSideBySide={!!isSettings}
                      placeholder="Select timezone"
                    >
                      <Select
                        name="timezone"
                        options={timezoneOptions}
                        value={getSelectedOption(values.timezone, timezoneOptions)}
                        onChange={(option: Option | null) => {
                          setFieldValue('timezone', option?.value || '');
                        }}
                        isDisabled={!hasAccess}
                        placeholder="Select timezone..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        styles={CustomStyles(false)}
                      />
                    </CustomInputField>
                  </div>
                </div>
              </div>

              {/* Row 3: Country, State & City */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-4'}>
                  <CustomInputField
                    validationSchema={validationSchema}
                    label="Country"
                    field={{
                      name: 'country',
                      value: values.country,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('country', e.target.value);
                      },
                    }}
                    error={errors.country as string}
                    isSideBySide={!!isSettings}
                    placeholder="Select country"
                  >
                    <Select
                      name="country"
                      options={countryOptions}
                      value={getSelectedOption(values.country, countryOptions)}
                      onChange={(option: Option | null) => {
                        setFieldValue('country', option?.label || '');
                        setFieldValue('state', '');
                        setFieldValue('city', '');
                        // Load states when country changes
                        if (option?.value) {
                          const states = State.getStatesOfCountry(option.value).map((state: any) => ({
                            value: state.isoCode,
                            label: state.name
                          }));
                          setStateOptions(states);
                        }
                      }}
                      isDisabled={!hasAccess}
                      placeholder="Select country..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      styles={CustomStyles(false)}
                    />
                  </CustomInputField>
                </div>

                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-4'}>
                  <CustomInputField
                    validationSchema={validationSchema}
                    label="State"
                    field={{
                      name: 'state',
                      value: values.state,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('state', e.target.value);
                      },
                    }}
                    error={errors.state as string}
                    isSideBySide={!!isSettings}
                    placeholder="Select state"
                  >
                    <Select
                      name="state"
                      options={stateOptions}
                      value={getSelectedOption(values.state, stateOptions)}
                      onChange={(option: Option | null) => {
                        setFieldValue('state', option?.label || '');
                        setFieldValue('city', '');
                        // Load cities when state changes
                        if (option?.value && values.country) {
                          const selectedCountry = countryOptions.find(c => c.label === values.country);
                          if (selectedCountry) {
                            const cities = City.getCitiesOfState(selectedCountry.value, option.value).map((city: any) => ({
                              value: city.name,
                              label: city.name
                            }));
                            setCityOptions(cities);
                          }
                        }
                      }}
                      isDisabled={!hasAccess || !values.country}
                      placeholder="Select state..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      styles={CustomStyles(false)}
                    />
                  </CustomInputField>
                </div>

                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-4'}>
                  <CustomInputField
                    validationSchema={validationSchema}
                    label="City"
                    field={{
                      name: 'city',
                      value: values.city,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('city', e.target.value);
                      },
                    }}
                    error={errors.city as string}
                    isSideBySide={!!isSettings}
                    placeholder="Select city"
                  >
                    <Select
                      name="city"
                      options={cityOptions}
                      value={getSelectedOption(values.city, cityOptions)}
                      onChange={(option: Option | null) => {
                        setFieldValue('city', option?.label || '');
                      }}
                      isDisabled={!hasAccess || !values.state}
                      placeholder="Select city..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      styles={CustomStyles(false)}
                    />
                  </CustomInputField>
                </div>
              </div>

              {/* Row 4: Address */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className="col-12">
                  <FormikField
                    name="address"
                    label="Company Address"
                    placeholder="Enter company address"
                    type="text"
                    validationSchema={validationSchema}
                    errors={errors}
                    icon={isSettings ? <MdOutlineEdit /> : ''}
                    rightIcon={!!isSettings}
                    disabled={!hasAccess}
                  />
                </div>
              </div>

              {/* Row 5: Official Email & Website */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <FormikField
                      name="official_email_id"
                      label="Official Mail ID"
                      placeholder="Enter official mail ID"
                      type="email"
                      validationSchema={validationSchema}
                      errors={errors}
                      icon={isSettings ? <MdOutlineEdit /> : ''}
                      rightIcon={!!isSettings}
                      disabled={!hasAccess}
                    />
                  </div>
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <FormikField
                      name="company_website_url"
                      label="Website"
                      placeholder="Enter company website"
                      type="text"
                      validationSchema={validationSchema}
                      errors={errors}
                      icon={isSettings ? <MdOutlineEdit /> : ''}
                      rightIcon={!!isSettings}
                      disabled={!hasAccess}
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Phone Number & Tax ID */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <FormikPhoneNumber
                      name="phone_number"
                      label="Phone Number"
                      validationSchema={validationSchema}
                      errors={errors.phone_number}
                      isDisabled={!hasAccess}
                    />
                  </div>
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <div>
                    <FormikField
                      name="tax_id"
                      label="Tax ID"
                      placeholder="Enter Tax ID"
                      type="text"
                      validationSchema={validationSchema}
                      errors={errors}
                      icon={isSettings ? <MdOutlineEdit /> : ''}
                      rightIcon={!!isSettings}
                      disabled={!hasAccess}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              {hasAccess && (
                <div
                  className={`${isSettings ? 'd-flex justify-content-end mt-3 mb-5' : 'd-flex justify-content-center company-information-btn-container'} `}
                >
                  {isSettings ? (
                    <div className="me-3">
                      <Button
                        text="Cancel"
                        onClick={() => resetForm()}
                        className="w-100"
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  <Button
                    text={
                      isSubmitting
                        ? `${isSettings ? 'Updating' : 'Saving...'}`
                        : `${isSettings ? 'Update' : 'Save & Proceed'}`
                    }
                    isDisabled={
                      isSettings ? !dirty || isSubmitting : isSubmitting
                    }
                    isLoading={isSubmitting}
                    type="submit"
                    isSolid
                    className={`w-100 ${isSettings ? '' : 'company-info-btn mt-2 mb-3'}`}
                    sufixIconChildren={
                      isSettings ? (
                        ''
                      ) : (
                        <MdArrowForward
                          size={20}
                          color="var(--icon-color)"
                          className="ms-3"
                        />
                      )
                    }
                  />
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}