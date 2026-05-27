import BusinessUnitForm from '@/components/BusinessUnitForm/BusinessUnitForm';
import CompanyInformationForm from '@/components/CompanyInformationForm/CompanyInformationForm';
import OrganisationSetupForm from '@/components/OrganisationSetupForm/OrganisationSetupForm';
import UserInviteForm from '@/components/UserInviteForm/UserInviteForm';
import { auth } from '@/lib/auth';
import { IUser } from '@/lib/interface/IUser.interface';
import { RoleService, UserService, AuthService } from '@/lib/service';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { slug: string } }) {
  const session = await auth();
  const headersList = headers();
  const host = headersList.get('host');
  const slug = host?.split('.')[0] ?? '';
  
  if (!session) {
    return redirect('/sign_in');
  }
  
  const token = (session?.user as { accessToken: string })?.accessToken;
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;

  const userResponse = await UserService.getCurrentUser(apiKey, token);
  const { user, success } = userResponse?.data as {
    user: IUser;
    success: boolean;
  };

  const roleRes = await RoleService.getCurrentAccess(apiKey, token);
  const { access } = roleRes?.data as {
    access: Record<string, string[]>;
  };

  if (!success) {
    return redirect('/sign_in');
  }

  // Fetch onboarding status using the API
  const onboardingStatusResponse = await AuthService.getOnboardingStatus(slug, token);
  const { success: onboardingSuccess, data: onboardingData } = onboardingStatusResponse?.data as {
    success: boolean;
    data: {
      onboarding_completed: boolean;
      step1_company_details_completed: boolean;
      step2_master_data_completed: boolean;
      current_step: number;
    };
  };

  if (onboardingSuccess && (onboardingData?.onboarding_completed || (onboardingData?.step1_company_details_completed && onboardingData?.step2_master_data_completed))) {
    return redirect('/dashboard');
  }

  const currentStep = onboardingData?.current_step ?? 1;
  
  const onboardingPath: Record<number, string> = {
    1: '/company_profile/company_information',
    2: '/company_profile/organisation_setup',
    3: '/company_profile/invite_user',
    4: '/dashboard',
  };

  // Get the target path based on current step
  const targetPath = onboardingPath[currentStep];

  // Function to determine if redirect is needed
  function resolveRedirectPath(
    currentSlug: string,
    currentTargetPath: string | undefined,
  ): string | null {
    if (!currentTargetPath) return null;
    
    // Check if current path matches the expected path for the current step
    const expectedSlug = currentTargetPath.split('/').pop();
    
    if (expectedSlug !== currentSlug) {
      return currentTargetPath;
    }
    
    return null;
  }

  // Handle redirect if user is on wrong page
  const redirectPath = resolveRedirectPath(params.slug, targetPath);
  if (redirectPath) {
    return redirect(redirectPath);
  }

  // Render the appropriate form based on current step
  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInformationForm token={token} slug={slug} account={user?.account} />;
      case 2:
        return <OrganisationSetupForm slug={slug} />;
      case 3:
        return <UserInviteForm slug={slug} />;
      case 4:
        return redirect('/dashboard');
      default:
        return <div>Access Denied</div>;
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      {renderForm()}
    </div>
  );
}