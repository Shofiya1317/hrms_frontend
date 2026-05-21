import BusinessUnitForm from '@/components/BusinessUnitForm/BusinessUnitForm';
import CompanyInformationForm from '@/components/CompanyInformationForm/CompanyInformationForm';
import OrganisationSetupForm from '@/components/OrganisationSetupForm/OrganisationSetupForm'; // Renamed component
import UserInviteForm from '@/components/UserInviteForm/UserInviteForm';
import { auth } from '@/lib/auth';
import { IUser } from '@/lib/interface/IUser.interface';
import { RoleService, UserService } from '@/lib/service';
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
  
const onboardingPath = [
  '/company_profile/company_information',     // Stage 0
  '/company_profile/organisation_setup',      // Stage 1
  '/company_profile/invite_user',             // Stage 2
  '/dashboard',                                     // Stage 3
];

  const currentOnboardingStage = user?.account?.current_onboarding_stage ?? -1;
  const adjustedOnboardingStage = currentOnboardingStage >= 4 ? 4 : currentOnboardingStage;
  const targetPath = onboardingPath[adjustedOnboardingStage];

  function resolveRedirectPath(
    currentSlug: string,
    currentTargetPath: string | undefined,
    _access: Record<string, string[]>,
  ): string | null {
    if (
      currentTargetPath
      && currentTargetPath !== `/company_profile/${currentSlug}`
    ) {
      if (currentTargetPath === '/dashboard') {
        return '/dashboard';
      }
      return currentTargetPath;
    }
    return null;
  }
  

  const redirectPath = resolveRedirectPath(params.slug, targetPath, access);
  if (redirectPath) {
    return redirect(redirectPath);
  }

  const content = (async () => {
    switch (params.slug) {
      case 'company_information':
        return <CompanyInformationForm token={token} slug={slug} account={user?.account} />;
      case 'organisation_setup': // Changed from business_unit
        return <OrganisationSetupForm slug={slug} />; // Renamed component
      case 'invite_user':
        return <UserInviteForm slug={slug} />;
      default:
        return <div>Access Denied</div>;
    }
  })();

  return (
    <div
      className={
        params.slug === 'standard_regulations'
          ? ''
          : 'd-flex justify-content-center align-items-center'
      }
    >
      {content}
    </div>
  );
}