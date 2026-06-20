import CompanyInformationForm from '@/components/CompanyInformationForm/CompanyInformationForm';
import OrganisationSetupForm from '@/components/OrganisationSetupForm/OrganisationSetupForm';
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

  const onboardingStep = user?.account?.onboarding_step ?? 1;

  // Step 3+ means onboarding is done → go to dashboard
  if (onboardingStep >= 3) {
    return redirect('/dashboard');
  }

  const onboardingPath: Record<number, string> = {
    1: '/company_profile/company_information',
    2: '/company_profile/organisation_setup',
  };

  // Redirect user to the correct step page if they're on the wrong one
  const targetPath = onboardingPath[onboardingStep];
  const expectedSlug = targetPath?.split('/').pop();

  if (expectedSlug && expectedSlug !== params.slug) {
    return redirect(targetPath);
  }

  // Render the appropriate form based on onboarding_step
  const renderForm = () => {
    switch (onboardingStep) {
      case 1:
        return <CompanyInformationForm token={token} slug={slug} account={user?.account} />;
      case 2:
        return <OrganisationSetupForm slug={slug} account={user?.account} />;
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
