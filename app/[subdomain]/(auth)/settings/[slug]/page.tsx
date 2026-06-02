import AccessWrapper from '@/components/AccessWrapper/AccessWrapper';
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
// ADMIN can access everything. HR gets org slugs except company_profile.
// EMPLOYEE only gets personal slugs.
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
          title: 'My profile',
          subTitle: 'Edit your personal information',
          component: (
            <AddorEditUser apiKey={apiKey} isCurrentUser user={user} id={id} />
          ),
        };

      case 'change_password':
        return {
          title: 'Change password',
          subTitle: 'Update your login credentials',
          component: <ChangePassword slug={apiKey} />,
        };

      case 'company_profile':
        return {
          title: 'Company profile',
          subTitle: 'Edit your company details',
          component: (
            <AccessWrapper module="ORGANIZATION" feature="READ">
              <CompanyInformationForm slug={apiKey} account={user?.account} />
            </AccessWrapper>
          ),
        };

      case 'organisation_setup':
        return {
          title: 'Organisation setup',
          subTitle: 'Manage departments, business units & policies',
          component: (
            <AccessWrapper module="SETTINGS" feature="ORGANISATION_SETUP">
              <OrganisationSetupForm slug={apiKey} />
            </AccessWrapper>
          ),
        };

      case 'invite_users':
        return {
          title: 'Invite users',
          subTitle: 'Onboard new employees into the system',
          component: (
            <AccessWrapper module="SETTINGS" feature="INVITE_USERS">
              <UserInviteForm slug={apiKey} />
            </AccessWrapper>
          ),
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
          <span className="settings-subtitle">{subTitle}</span>
          <h4 className="fw-700 mb-0">{title}</h4>
        </div>
      )}
      {component}
    </div>
  );
}
