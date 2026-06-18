import AddorEditUser from '@/components/AddorEditUser/AddorEditUser';
import OrganisationSetupForm from '@/components/OrganisationSetupForm/OrganisationSetupForm';
import ChangePassword from '@/components/ChangePassword/ChangePassword';
import CompanyInformationForm from '@/components/CompanyInformationForm/CompanyInformationForm';
import UserInviteForm from '@/components/UserInviteForm/UserInviteForm';
import PageNotFound from '@/components/PageNotFound/PageNotFound';
import { auth } from '@/lib/auth';
import { IUser } from '@/lib/interface/IUser.interface';
import { UserService } from '@/lib/service';
import { redirect } from 'next/navigation';
import './SettingsLayout.css';

// Slugs that each role is allowed to access.
const ROLE_ALLOWED_SLUGS: Record<string, string[]> = {
  ADMIN: [
    'profile',
    'change_password',
    'company_profile',
    'organisation_setup',
    'invite_users',
  ],
  HR: ['profile', 'change_password', 'organisation_setup', 'invite_users'],
  EMPLOYEE: ['profile', 'change_password'],
};

export default async function page({ params }: { params: { slug?: string } }) {
  const session = await auth();
  if (!session) {
    return redirect('/sign_in');
  }

  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  const accessToken = (session?.user as unknown as { accessToken: string })
    ?.accessToken;
  const id = (session?.user as IUser)?.id;

  const userRes = await UserService.getCurrentUser(apiKey, accessToken);
  const { user } = userRes?.data as { user: IUser; success: boolean };

  const role = user?.role as 'ADMIN' | 'HR' | 'EMPLOYEE';
  const slug = params.slug ?? '';

  // Guard: redirect to profile if role has no access to requested slug
  const allowedSlugs = ROLE_ALLOWED_SLUGS[role] ?? [];
  if (slug && !allowedSlugs.includes(slug)) {
    return redirect('/settings/profile');
  }

  type PageConfig = {
    title: string;
    subTitle: string;
    component: React.ReactNode;
  };

  const getPageConfig = (): PageConfig => {
    switch (slug) {
      case 'profile':
        return {
          title: 'My Profile',
          subTitle: 'Manage your personal information and preferences',
          component: (
            <AddorEditUser apiKey={apiKey} isCurrentUser user={user} id={id} />
          ),
        };

      case 'change_password':
        return {
          title: 'Change Password',
          subTitle: 'Update your account security credentials',
          component: <ChangePassword slug={apiKey} />,
        };

      case 'company_profile':
        return {
          title: 'Company Profile',
          subTitle: 'Manage your company information, address, and details',
          component: (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <CompanyInformationForm slug={apiKey} account={user?.account} />
            </div>
          ),
        };

      case 'organisation_setup':
        return {
          title: 'Organisation Setup',
          subTitle: 'Configure departments, business units, shifts, and policies',
          component: <OrganisationSetupForm slug={apiKey} />,
        };

      case 'invite_users':
        return {
          title: 'Invite Users',
          subTitle: 'Send invitations to onboard new employees into the system',
          component: <UserInviteForm slug={apiKey} />,
        };

      default:
        return {
          title: '',
          subTitle: '',
          component: <PageNotFound isAccessDenied />,
        };
    }
  };

  const { title, subTitle, component } = getPageConfig();

  return (
    <div className="p-1 p-md-4">
      {title && (
        <div className="pb-4">
          <p className="text-sm text-gray-500 mb-1">{subTitle}</p>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="mt-4">
        {component}
      </div>
    </div>
  );
}
