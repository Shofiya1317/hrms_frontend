/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { IAccount } from '@/lib/interface/IAccount.interface';
import { AuthService, MastersService } from '@/lib/service';
import { IIndustry, IMastersListResponse } from '@/lib/interface/IMasters.interface';
import { Form, Formik, FormikHelpers } from 'formik';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdArrowForward, MdOutlineEdit } from 'react-icons/md';
import Select from 'react-select';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { array, object, string } from 'yup';

import { Button } from '../Button/Button';
import { FormikField } from '../FormikField/FormikField';
import { FormikPhoneNumber } from '../FormikPhoneNumber/FormikPhoneNumber';
import { CustomInputField } from '../InputField/CustomInputField';
import { Option } from '../types';
import CustomStyles from '../CustomStyles/CustomStyles';
import './CompanyInformationForm.css';

import { Country, State, City } from 'country-state-city';
import { TIMEZONE_OPTIONS, getDefaultTimezone } from '@/components/constants/timezone';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  tax_id?: string;
  standards: string[];
  time_frame: string;
}

// ─── Static Options ───────────────────────────────────────────────────────────

const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5001+', label: '5001+ employees' },
];

// ─── Submit Handler ───────────────────────────────────────────────────────────

const handleCompanyProfileSubmit = async (
  values: CompanyInformation,
  slug: string,
  {
    setSubmitting,
    validateForm,
    setFieldError,
  }: FormikHelpers<CompanyInformation>,
  router: AppRouterInstance,
  isSettings: boolean,
) => {
  if (
    values?.phone_number?.length > 0
    && !isValidPhoneNumber(values?.phone_number)
  ) {
    setFieldError('phone_number', 'Must be valid Phone Number');
    return;
  }

  validateForm(values);
  setSubmitting(true);

  try {
    let res;

    if (!isSettings) {
      // Onboarding flow
      const onboardingPayload = {
        company_name: values.company_name,
        industry: values.industry,
        company_size: values.company_size,
        country: values.country,
        state: values.state,
        city: values.city,
        address: values.address,
        official_email_id: values.official_email_id,
        website: values.company_website_url,
        phone_number: values.phone_number,
        tax_id: values.tax_id,
      };
      res = await AuthService.onboardingStep1(onboardingPayload, slug);
    } else {
      // Settings flow
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

      res = await AuthService.companyInformation(apiPayload, slug, {
        onboarding: false,
      });
    }

    const { success, message } = res?.data as {
      success: boolean;
      message: string;
    };

    if (success) {
      toast.success(
        message || (isSettings ? 'Company Information Updated' : 'Company Information Registered'),
      );
      if (!isSettings) {
        router.push('/company_profile/organisation_setup');
      } else {
        router.refresh();
      }
    } else {
      toast.error(message || 'Something went wrong. Please try again.');
    }
  } catch {
    toast.error('Something went wrong. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompanyInformationForm({
  token,
  slug,
  account,
}: Readonly<{ token?: string; slug: string; account?: IAccount | null }>) {
  const { isMobileOnly } = useDeviceDetection();
  const pathname = usePathname();
  const router = useRouter();
  const isSettings = pathname?.startsWith('/settings');

  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [cityOptions, setCityOptions] = useState<Option[]>([]);
  const [industryOptions, setIndustryOptions] = useState<Option[]>([
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
  ]);

  /**
   * Populates stateOptions and cityOptions from account data.
   * Only used in the Settings flow to pre-fill existing values.
   * Matches country by EITHER full name ("India") OR ISO code ("IN").
   */
  const populateStateCityFromAccount = (acct?: IAccount | null) => {
    if (!acct?.country) return;

    const allCountries = Country.getAllCountries();

    // Match by name first, then fall back to isoCode match
    const matchedCountry = (allCountries as any[]).find((c) => c.name === acct.country)
      ?? (allCountries as any[]).find((c) => c.isoCode === acct.country);

    if (!matchedCountry) return;

    const states = State.getStatesOfCountry(matchedCountry.isoCode).map(
      (s: any) => ({ value: s.isoCode, label: s.name }),
    );
    setStateOptions(states);

    if (acct.state) {
      // Match state by label (full name) OR by isoCode
      const matchedState = states.find((s) => s.label === acct.state)
        ?? states.find((s) => s.value === acct.state);

      if (matchedState) {
        const cities = City.getCitiesOfState(
          matchedCountry.isoCode,
          matchedState.value,
        ).map((c: any) => ({ value: c.name, label: c.name }));
        setCityOptions(cities);
      }
    }
  };

  useEffect(() => {
    // Load countries
    const countries = Country.getAllCountries().map((country: any) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountryOptions(countries);

    // Only pre-populate state/city options in Settings flow
    if (isSettings) {
      populateStateCityFromAccount(account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run state/city population whenever account prop changes — Settings only
  useEffect(() => {
    if (isSettings && account?.country) {
      populateStateCityFromAccount(account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.country, account?.state]);

  // ─── Validation Schema ──────────────────────────────────────────────────────

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
        'Enter a valid website URL',
      )
      .nullable(),
    phone_number: string().nullable(),
    tax_id: string()
      .nullable()
      .test(
        'tax-id-format',
        'Invalid Tax ID format',
        (value) => !value || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value),
      ),
    sectors: array().nullable(),
    standards: array().nullable(),
    time_frame: string().nullable(),
  });

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (
    values: CompanyInformation,
    formikHelpers: FormikHelpers<CompanyInformation>,
  ) => {
    if (
      values?.phone_number?.length > 0
      && !isValidPhoneNumber(values?.phone_number)
    ) {
      formikHelpers.setFieldError('phone_number', 'Must be valid Phone Number');
      return;
    }

    await handleCompanyProfileSubmit(
      values,
      slug,
      formikHelpers,
      router,
      isSettings,
    );
  };

  // ─── Initial Values ─────────────────────────────────────────────────────────

  const initialValues: CompanyInformation = {
    company_name: account?.account_name ?? account?.company_name ?? '',
    industry: account?.industry ?? account?.industries?.[0] ?? '',
    company_size: account?.company_size ?? '',
    // In onboarding: always start blank so the user must select.
    // In settings: pre-fill from existing account data.
    country: isSettings ? (account?.country ?? '') : '',
    state: isSettings ? (account?.state ?? '') : '',
    city: isSettings ? (account?.city ?? '') : '',
    timezone: account?.timezone ?? getDefaultTimezone(),
    address: account?.address ?? '',
    official_email_id: account?.official_email_id ?? '',
    sectors: account?.sectors ?? [],
    company_website_url: account?.website ?? account?.website_url ?? '',
    phone_number: account?.phone_number ?? '',
    tax_id: account?.tax_id ?? '',
    standards: account?.standards ?? ['BRSR'],
    time_frame: 'quarter',
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const className = () => {
    if (isMobileOnly) return { width: '290px' };
    if (isSettings) return { width: '100%' };
    return { width: '700px' };
  };

  const getSelectedOption = (value: string, options: Option[]) => options.find((option) => option.value === value || option.label === value)
    || null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={className()}>
      {!isSettings && (
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
                  <FormikField
                    name="company_name"
                    label="Company Name"
                    placeholder="Enter your company name"
                    type="text"
                    validationSchema={validationSchema}
                    errors={errors}
                    icon={isSettings ? <MdOutlineEdit /> : ''}
                    rightIcon={!!isSettings}
                  />
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <CustomInputField
                    validationSchema={validationSchema}
                    label="Industry"
                    field={{
                      name: 'industry',
                      value: values.industry,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('industry', e.target.value),
                    }}
                    error={errors.industry as string}
                    isSideBySide={!!isSettings}
                    placeholder="Select industry type"
                  >
                    <Select
                      name="industry"
                      options={industryOptions}
                      value={getSelectedOption(values.industry, industryOptions)}
                      onChange={(option: Option | null) => setFieldValue('industry', option?.value || '')}
                      placeholder="Select industry..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      styles={CustomStyles(false)}
                    />
                  </CustomInputField>
                </div>
              </div>

              {/* Row 2: Company Size & Timezone */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <CustomInputField
                    validationSchema={validationSchema}
                    label="Company Size"
                    field={{
                      name: 'company_size',
                      value: values.company_size,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('company_size', e.target.value),
                    }}
                    error={errors.company_size as string}
                    isSideBySide={!!isSettings}
                    placeholder="Select company size"
                  >
                    <Select
                      name="company_size"
                      options={companySizeOptions}
                      value={getSelectedOption(
                        values.company_size,
                        companySizeOptions,
                      )}
                      onChange={(option: Option | null) => setFieldValue('company_size', option?.value || '')}
                      placeholder="Select company size..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      styles={CustomStyles(false)}
                    />
                  </CustomInputField>
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <CustomInputField
                    validationSchema={validationSchema}
                    label="Timezone"
                    field={{
                      name: 'timezone',
                      value: values.timezone,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('timezone', e.target.value),
                    }}
                    error={errors.timezone as string}
                    isSideBySide={!!isSettings}
                    placeholder="Select timezone"
                  >
                    <Select
                      name="timezone"
                      options={TIMEZONE_OPTIONS}
                      value={getSelectedOption(values.timezone, TIMEZONE_OPTIONS)}
                      onChange={(option: Option | null) => setFieldValue('timezone', option?.value || '')}
                      placeholder="Select timezone..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      styles={CustomStyles(false)}
                    />
                  </CustomInputField>
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
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('country', e.target.value),
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
                        setStateOptions([]);
                        setCityOptions([]);
                        if (option?.value) {
                          const states = State.getStatesOfCountry(
                            option.value,
                          ).map((state: any) => ({
                            value: state.isoCode,
                            label: state.name,
                          }));
                          setStateOptions(states);
                        }
                      }}
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
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('state', e.target.value),
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
                        setCityOptions([]);
                        if (option?.value && values.country) {
                          const selectedCountry = countryOptions.find(
                            (c) => c.label === values.country,
                          );
                          if (selectedCountry) {
                            const cities = City.getCitiesOfState(
                              selectedCountry.value,
                              option.value,
                            ).map((city: any) => ({
                              value: city.name,
                              label: city.name,
                            }));
                            setCityOptions(cities);
                          }
                        }
                      }}
                      isDisabled={!values.country}
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
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('city', e.target.value),
                    }}
                    error={errors.city as string}
                    isSideBySide={!!isSettings}
                    placeholder="Select city"
                  >
                    <Select
                      name="city"
                      options={cityOptions}
                      value={getSelectedOption(values.city, cityOptions)}
                      onChange={(option: Option | null) => setFieldValue('city', option?.label || '')}
                      isDisabled={!values.state}
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
                  />
                </div>
              </div>

              {/* Row 5: Official Email & Website */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <FormikField
                    name="official_email_id"
                    label="Official Mail ID"
                    placeholder="Enter official mail ID"
                    type="email"
                    validationSchema={validationSchema}
                    errors={errors}
                    icon={isSettings ? <MdOutlineEdit /> : ''}
                    rightIcon={!!isSettings}
                  />
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <FormikField
                    name="company_website_url"
                    label="Website"
                    placeholder="Enter company website"
                    type="text"
                    validationSchema={validationSchema}
                    errors={errors}
                    icon={isSettings ? <MdOutlineEdit /> : ''}
                    rightIcon={!!isSettings}
                  />
                </div>
              </div>

              {/* Row 6: Phone Number & Tax ID */}
              <div className={`row ${isSettings ? 'mt-0' : 'mt-2'}`}>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <FormikPhoneNumber
                    name="phone_number"
                    label="Phone Number"
                    validationSchema={validationSchema}
                    errors={errors.phone_number}
                  />
                </div>
                <div className={isSettings ? 'col-lg-12' : 'col-12 col-lg-6'}>
                  <FormikField
                    name="tax_id"
                    label="Tax ID"
                    placeholder="Enter Tax ID"
                    type="text"
                    validationSchema={validationSchema}
                    errors={errors}
                    icon={isSettings ? <MdOutlineEdit /> : ''}
                    rightIcon={!!isSettings}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div
                className={`${
                  isSettings
                    ? 'd-flex justify-content-end mt-3 mb-5'
                    : 'd-flex justify-content-center company-information-btn-container'
                }`}
              >
                {isSettings && (
                  <div className="me-3">
                    <Button
                      text="Cancel"
                      onClick={() => resetForm()}
                      className="w-100"
                    />
                  </div>
                )}
                <Button
                  text={
                    isSubmitting
                      ? `${isSettings ? 'Updating' : 'Saving...'}`
                      : `${isSettings ? 'Update' : 'Save & Proceed'}`
                  }
                  isDisabled={isSettings ? !dirty || isSubmitting : isSubmitting}
                  isLoading={isSubmitting}
                  type="submit"
                  isSolid
                  className={`w-100 ${
                    isSettings ? '' : 'company-info-btn mt-2 mb-3'
                  }`}
                  sufixIconChildren={
                    !isSettings && (
                      <MdArrowForward
                        size={20}
                        color="var(--icon-color)"
                        className="ms-3"
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
