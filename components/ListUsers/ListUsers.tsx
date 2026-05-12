/* eslint-disable react/no-unstable-nested-components */

'use client';

import { IMeta } from '@/lib/interface/IMeta.interface';
import { IUser, IUserFilter } from '@/lib/interface/IUser.interface';
import { UserService } from '@/lib/service';
import { convertToPascalCase, Params } from '@/lib/utils';
import { Session } from 'next-auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { TableColumn } from 'react-data-table-component';
import { toast } from 'react-hot-toast';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { MdBlock } from 'react-icons/md';
import { FaUserGroup } from 'react-icons/fa6';
import AddorEditUser from '../AddorEditUser/AddorEditUser';
import BlockOrUnblockOrDelete from '../BlockOrUnblockOrDelete/BlockOrUnblockOrDelete';
import { Button } from '../Button/Button';
import { useUser } from '../Context/userProvider';
import Filter from '../Filter/Filter';
import UserFilter from '../Filter/UserFilter/UserFilter';
import { useModal } from '../Modal/Context';
import PageHeaderWrapper from '../PageHeaderWrapper/PageHeaderWrapper';
import { Pill } from '../Pill/Pill';
import Search from '../Search/Search';
import Sort from '../Sort/Sort';
import Table from '../Table/Table';
import { ActionType } from '../types';

export const getModalTitle = (actionType: ActionType) => {
  if (actionType === 'ResendInvitation') return 'Resend Invitation';
  if (actionType === 'Edit') return 'Edit User';
  return 'Invite User';
};

export const getActionMessage = (actionType: ActionType) => {
  if (actionType === 'Block') {
    return 'block this user';
  }
  if (actionType === 'Unblock') {
    return 'unblock this user';
  }
  return 'delete this user';
};

export const closeModal = (
  hideModal: () => void,
  setCurrentUser: (data: undefined) => void,
  setActionType: (data: null) => void,
  router: AppRouterInstance,
) => {
  hideModal();
  setCurrentUser(undefined);
  setActionType(null);
  router.refresh();
};

export const handleConfirm = async (
  currentUser: IUser | undefined,
  actionType: ActionType,
  params: {
    reason: string;
    apiKey: string;
  },
  hideModal: () => void,
  setCurrentUser: (data: undefined) => void,
  setActionType: (data: null) => void,
  router: AppRouterInstance,
) => {
  if (!currentUser) {
    return;
  }
  if (actionType === 'Block' && params?.reason.length <= 0) {
    toast.error('Please provide reason');
    return;
  }
  let response;
  if (actionType === 'Block') {
    response = await UserService.blockUser(
      {
        blocked_reason: params?.reason,
      },
      params?.apiKey,
      currentUser?.id,
    );
  } else if (actionType === 'Unblock') {
    response = await UserService.unBlockUser(params?.apiKey, currentUser.id);
  } else if (actionType === 'Delete') {
    response = await UserService.deleteUser(params?.apiKey, currentUser.id);
  }
  const { success, error } = response?.data as {
    success: boolean;
    error: string[];
  };

  if (success) {
    toast.success(
      `User ${actionType?.toLocaleLowerCase()?.includes('block') ? `${actionType}ed` : `${actionType}`}`,
    );
    closeModal(hideModal, setCurrentUser, setActionType, router);
  } else {
    toast.error(error[0]);
  }
};

interface ActionCellProps {
  row: IUser;
  setActionType: (data: ActionType) => void;
  setCurrentUser: (data: IUser | undefined) => void;
  session: Session | null;
  roleAccess: Record<string, string[]> | undefined;
}

const ActionCell = ({
  row,
  setActionType,
  setCurrentUser,
  session,
  roleAccess,
}: ActionCellProps) => {
  const currentUser = session?.user as IUser;
  const hasAccess = (feature: string) => roleAccess?.USERS?.includes(feature);
  const canAccess = hasAccess('UPDATE')
    || hasAccess('DELETE')
    || hasAccess('BLOCK/UNBLOCK')
    || hasAccess('RESEND_INVITE');

  if (!canAccess) {
    return <div>-</div>;
  }

  return (
    <div className="ms-2" data-testid="action">
      <Dropdown>
        <Dropdown.Toggle className="dropdownTitle" data-testid="action">
          <BsThreeDotsVertical color="var(--textdark)" fontSize={22} />
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-css p-3">
          {row?.status === 'ACTIVE' && hasAccess('UPDATE') && (
          <Dropdown.Item
            data-testid="Edit"
            onClick={() => {
              setActionType('Edit');
              setCurrentUser(row);
            }}
            className="d-flex align-items-center gap-2"
          >
            <FiEdit size={20} color="#FBA900" />
            <span className="fs-12 fw-500">Edit</span>
          </Dropdown.Item>
          )}
          {row?.id !== currentUser?.id && hasAccess('DELETE') && (
          <Dropdown.Item
            data-testid="Delete"
            onClick={() => {
              setActionType('Delete');
              setCurrentUser(row);
            }}
            className="d-flex align-items-center gap-2"
          >
            <RiDeleteBinLine size={20} color="#FBA900" />
            <span className="fs-12 fw-500">Delete</span>
          </Dropdown.Item>
          )}
          {row?.status === 'ACTIVE'
            && hasAccess('BLOCK/UNBLOCK')
            && row?.id !== currentUser?.id && (
              <Dropdown.Item
                data-testid="Block"
                onClick={() => {
                  setActionType('Block');
                  setCurrentUser(row);
                }}
                className="d-flex align-items-center gap-2"
              >
                <MdBlock size={20} color="#FBA900" />
                <span className="fs-12 fw-500">Block</span>
              </Dropdown.Item>
          )}
          {row?.status === 'BLOCKED' && hasAccess('BLOCK/UNBLOCK') && (
          <Dropdown.Item
            data-testid="Unblock"
            onClick={() => {
              setActionType('Unblock');
              setCurrentUser(row);
            }}
            className=""
          >
            Unblock
          </Dropdown.Item>
          )}
          {row?.status === 'PENDING' && hasAccess('RESEND_INVITE') && (
          <Dropdown.Item
            data-testid="ResendInvitation"
            onClick={() => {
              setCurrentUser(row);
              setActionType('ResendInvitation');
            }}
            className=""
          >
            Resend Invitation
          </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default function ListUsers({
  users,
  meta,
  params,
  session,
}: Readonly<{
  users: IUser[];
  meta: IMeta;
  params: IUserFilter;
  session: Session | null;
}>) {
  const context = useUser();
  const hideModal = useModal({});
  const apiKey = (session?.user as { apiKey: string })?.apiKey;
  const currentUserId = (session?.user as IUser)?.id;
  const router = useRouter();
  const [actionType, setActionType] = useState<ActionType>(null);
  const [currentUser, setCurrentUser] = useState<IUser | undefined>(undefined);

  // console.log(context)
  // console.log(context?.currentRole)
  // console.log(context?.currentUser?.USERS)

  const modal = useModal({
    style: {
      title: getModalTitle(actionType),
    },
    content: (
      <AddorEditUser
        apiKey={apiKey}
        user={currentUser}
        isResendInvitation={actionType === 'ResendInvitation'}
        onClose={() => closeModal(hideModal, setCurrentUser, setActionType, router)}
        id={currentUserId}
        isInvite={actionType === 'Invite'}
      />
    ),
  });

  const blockOrUnblockOrDeleteModal = useModal({
    content: (
      <BlockOrUnblockOrDelete
        actionType={actionType}
        onConfirm={(reason: string) => handleConfirm(
          currentUser,
          actionType,
          {
            reason,
            apiKey,
          },
          hideModal,
          setCurrentUser,
          setActionType,
          router,
        )}
        onClose={() => closeModal(hideModal, setCurrentUser, setActionType, router)}
        deleteText={`Are you sure you want to ${getActionMessage(actionType)}?`}
      />
    ),
  });

  useEffect(() => {
    if (!currentUser && actionType === 'Invite') {
      modal();
    }
    switch (actionType) {
      case 'Edit':
      case 'ResendInvitation':
        modal();
        break;
      case 'Block':
      case 'Unblock':
      case 'Delete':
        blockOrUnblockOrDeleteModal();
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, actionType]);

  const columns: TableColumn<IUser>[] = [
    {
      name: <div className="fs-13 font-semibold letter-spacing">Name</div>,
      cell: (row) => (
        <div className="fs-12 font-semibold letter-spacing text-capitalize">
          {row.name || '-'}
        </div>
      ),
      sortable: true,
      minWidth: '200px',
    },
    {
      name: <div className="fs-13 font-semibold letter-spacing">Mail ID</div>,
      cell: (row) => row.email,
      sortable: true,
      minWidth: '200px',
    },
    {
      name: <div className="fs-13 font-semibold letter-spacing">Role</div>,
      cell: (row) => convertToPascalCase(row.role?.replaceAll('_', ' ')),
      sortable: true,
      minWidth: '200px',
    },
    {
      name: <div className="fs-13 font-semibold letter-spacing">Created At</div>,
      cell: (row) => new Date(row?.createdAt).toLocaleDateString('en-GB'),
      sortable: true,
      minWidth: '200px',
    },
    {
      name: <div className="fs-13 font-semibold letter-spacing">Status</div>,
      cell: (row) => <Pill pillText={row?.status} />,
      sortable: true,
      minWidth: '200px',

    },

    {
      name: <div className="fs-13 font-semibold letter-spacing">Actions</div>,
      cell: (row: IUser) => (
        <ActionCell
          row={row}
          setActionType={setActionType}
          setCurrentUser={setCurrentUser}
          session={session}
          roleAccess={context?.currentRole}
        />
      ),
      sortable: false,
      minWidth: '200px',
    },
  ];

  return (
    <div className=" bg-white">
      <PageHeaderWrapper
        extraClassName="my-1 px-4 pt-1 pb-0 mb-0"
        iswhite
        title={`Users (${meta?.totalCount || 0})`}
        stackComponent={(
          <div className="flex gap-3 flex-grow justify-end flex-wrap md:flex-nowrap">
            <div className="">
              <Search
                params={params as unknown as Params}
                placeholder="Search User"
              />
            </div>
            <div>
              <Sort params={params as unknown as Params} />
            </div>
            <div>
              <Filter>
                <UserFilter params={params} />
              </Filter>
            </div>
            {context?.currentRole?.USERS?.includes('INVITE') && (
              <div>
                <Button
                  text="Invite Users"
                  onClick={() => {
                    setActionType('Invite');
                  }}
                  className="reset-default px-2"
                  prefixIconChildren={
                    // <UsersRound size={24} color="var(--icon-color)" />
                    <FaUserGroup size={20} color="var(--icon-color)" className="mr-2" />
                  }
                  isSolid
                />
              </div>
            )}
          </div>
        )}
      >
        <Table<IUser> data={users} columns={columns} meta={meta} />
      </PageHeaderWrapper>
    </div>
  );
}
