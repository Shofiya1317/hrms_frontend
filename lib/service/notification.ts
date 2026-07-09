import { get, patch } from '../axiosInstance';
import { Params } from '../utils';

export interface INotification {
  id: string;
  recipient_user_id: string;
  sender_user_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  priority: string;
  reference_type?: string;
  reference_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  createdAt?: string;
  updatedAt?: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface IQueryNotificationParams extends Params {
  page?: number;
  limit?: number;
  is_read?: boolean;
}

export const getNotifications = (
  tenantId: string,
  params?: IQueryNotificationParams,
  token?: string,
) => get(
  '/v1/notifications',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getUnreadCount = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/notifications/unread-count',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const markAsRead = (
  id: string,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/notifications/${id}/read`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const markAllAsRead = (
  tenantId: string,
  token?: string,
) => patch(
  '/v1/notifications/read-all',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
