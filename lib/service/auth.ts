import { IUserRole } from '@/components/types';
import { get, post, put } from '../axiosInstance';
import { Params } from '../utils';

export const signIn = (
  params: {
    email: string;
    password: string;
    slug: string;
  },
) => post(
  '/v1/auth/signin',
  params,
  null,
  params?.slug as string,
  {
    isFetchToken: false,
  },
);

export const signUp = (
  params: {
    name: string,
    account_name: string,
    slug: string,
    email: string,
    phone_number?: string
  },
) => post(
  '/auth/signup',
  params,
  null,
  undefined,
  {
    isFetchToken: false,
  },
);

export const socialSignUp = (
  params: Params,
) => post(
  '/auth/social_signup',
  params,
  null,
  undefined,
  {
    isFetchToken: false,
  },
);

export const socialSignIn = (
  params: Params,
) => post(
  '/v1/auth/social_login',
  {
    provider: params?.provider,
    token: params?.token,
  },
  null,
  params?.slug as string,
  {
    isFetchToken: false,
  },
);

export const tokenVerify = (
  token: string,
  slug?: string,
) => post(
  `/auth/${token}/confirm`,
  undefined,
  undefined,
  slug,
  {
    isFetchToken: false,
  },
);

export const refreshToken = (
  slug: string,
  token: string,
) => get(
  '/v1/auth/refresh',
  undefined,
  slug,
  {
    bearerToken: token,
    isFetchToken: false,
  },
  undefined,
);

export const getSessions = (
  slug: string,
  token?: string,
) => get(
  '/v1/auth/me',
  undefined,
  slug,
  {
    bearerToken: token,
    isFetchToken: false,
  },
  undefined,
);

export const slugVerify = (
  slug: string,
) => post(
  `/auth/slug/${slug}`,
  undefined,
  undefined,
  undefined,
  {
    isFetchToken: false,
  },
);

export const resetPassword = async (
  params: {
    token: string;
    password: string;
    passwordConfirmation: string;
    slug: string;
  },
) => post(
  '/v1/auth/reset_password',
  {
    token: params.token,
    password: params.password,
    passwordConfirmation: params.passwordConfirmation,
  },
  null,
  params.slug,
);

export const forgotPassword = async (
  params: {
    email: string
    slug: string;
  },
) => post(
  '/v1/auth/forgot_password',
  {
    email: params.email,
  },
  null,
  params.slug,
);

export const logout = async (
  params: {
    slug: string
  },
) => post(
  '/v1/auth/logout',
  undefined,
  undefined,
  params.slug,
);

export const acceptTokenVerify = async (
  token: string,
  slug: string,
  req?: unknown,
) => get(
  `/v1/auth/${token}/verify`,
  undefined,
  slug,
  undefined,
  req,
);

export const acceptInvitation = async (
  token: string,
  slug: string,
  params: {
    name: string,
    phone_number: string,
    password: string,
    confirm_password: string,
    accept_terms_and_conditions: boolean
  },
) => post(
  '/v1/auth/accept_invitation',
  {
    token,
    password: params.password,
    confirm_password: params.confirm_password,
    name: params.name,
    phone_number: params.phone_number,
    accept_terms_and_conditions: params.accept_terms_and_conditions,
  },
  undefined,
  slug,
);

export const acceptInvitationByAdmin = async (
  token: string,
  slug: string,
  params: {
    password: string,
    confirm_password: string,
    accept_terms_and_conditions: boolean
  },
) => post(
  '/auth/acceptInvitation',
  {
    token,
    password: params.password,
    confirm_password: params.confirm_password,
    accept_terms_and_conditions: params.accept_terms_and_conditions,
  },
  undefined,
  slug,
  {
    isFetchToken: false,
  },
);

export const acceptAccountInvitation = async (
  token: string,
  slug: string,
  params: {
    password: string,
    confirm_password: string,
    accept_terms_and_conditions: boolean
  },
) => post(
  '/auth/acceptInvitation',
  {
    token,
    password: params.password,
    confirm_password: params.confirm_password,
    accept_terms_and_conditions: params.accept_terms_and_conditions,
  },
  undefined,
  undefined,
  {
    isFetchToken: false,
  },
);

export const verifyMagicLinkToken = async (
  token: string,
  id: string,
  slug: string,
  req?: unknown,
) => post(
  '/v1/auth/verify_token',
  {
    token,
    entity_id: id,
  },
  undefined,
  slug,
  undefined,
  req,
);

export const updateOnboarding = async (
  apiKey: string,
  onboarding: 'standard' | 'invite' | 'plan' | 'business_unit' | undefined,
) => put(
  '/v1/auth/update/onboarding',
  undefined,
  { onboarding },
  apiKey,
);

export const resendInvitation = async (
  params: {
    email: string
    slug: string;
    id: string;
  },
) => post(
  `/v1/auth/${params?.id}/resend_invitation`,
  {
    email: params.email,
  },
  null,
  params.slug,
);

export const inviteUsers = async (
  params: {
    email: string,
    name?: string,
    role: IUserRole | undefined,
  }[],
  tenantId: string,
) => post(
  '/v1/auth/invitation',
  {
    invitation: params,
  },
  undefined,
  tenantId,
);

// Verify invitation token - GET endpoint that returns employee/user details
export const verifyInvitation = async (
  token: string,
  slug: string,
) => get(
  `/v1/auth/${token}/verify`,
  undefined,
  slug,
  {
    isFetchToken: false,
  },
);

export const verifyAccountInvitation = async (
  token: string,
  slug: string,
) => post(
  `/auth/${token}/acceptInvatation`,
  undefined,
  undefined,
  slug,
  {
    isFetchToken: false,
  },
);

export const companyInformation = (
  params: {
    company_name: string,
    official_email_id: string,
    company_website_url: string,
    phone_number: string,
    tax_id: string,
    address: string,
    industries: string[],
    sectors: string[],
    standards: string[],
  },
  slug: string,
  query?: {
    onboarding: boolean
  },
) => put(
  '/v1/auth/company_details',
  params,
  query,
  slug,
);

export const onboardingStep1 = (
  params: {
    company_name: string;
    industry: string;
    country: string;
    state: string;
    city: string;
    address: string;
    official_email_id: string;
    website: string;
    phone_number: string;
    tax_id: string;
  },
  slug: string,
) => put(
  '/v1/auth/onboarding/step1',
  params,
  undefined,
  slug,
);

export const onboardingStep2 = (
  params: {
    work_location_ids?: string[];
    department_ids?: string[];
    shift_ids?: string[];
    work_schedule_ids?: string[];
  },
  slug: string,
) => put(
  '/v1/auth/onboarding/step2',
  params,
  undefined,
  slug,
);

export const getOnboardingStep2 = (
  slug: string,
 
  token?: string,
) => get(
  '/v1/auth/onboarding/step2',
  undefined,
  slug,
  { bearerToken: token, isFetchToken: !token },
);

export const invitePeople = (
  params: {
    slug: string,
    invitation: Array<{
      email: string,
      name: string,
      role: string,
    }>
  },
) => post(
  '/v1/auth/invitation',
  params,
  { onboarding: true },
  params?.slug as string,
);

export const resendInvitationForSignUp = (
  params: {
    email: string,
    slug: string,
  },
) => post(
  '/auth/resendInvitation',
  params,
  undefined,
  undefined,
  {
    isFetchToken: false,
  },
);

export const getOnboardingStatus = (
  slug: string,
  token?: string,
) => get(
  '/v1/auth/onboarding/status',
  undefined,
  slug,
  { bearerToken: token, isFetchToken: !token },
);

export const getVerifyAdminToken = (token: string) => get(
  `/admin/${token}/accountverify`,
  undefined,
  undefined,
  {
    isFetchToken: false,
  },
);
