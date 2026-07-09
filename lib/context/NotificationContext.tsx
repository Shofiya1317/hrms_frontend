'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  INotification
} from '../service/notification';

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  socketConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  socketConnected: false,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const params = useParams();
  const queryClient = useQueryClient();
  const [socketConnected, setSocketConnected] = useState(false);

  const token = (session?.user as any)?.accessToken;
  const tenantId = (session?.user as any)?.apiKey;
  const subdomain = params?.subdomain as string;

  // Query notifications list
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', tenantId, token],
    queryFn: async () => {
      if (!tenantId) return [];
      const res = await getNotifications(tenantId, { page: 1, limit: 50 }, token);
      return res?.data?.items ?? [];
    },
    enabled: !!tenantId && !!token,
  });

  // Query unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notificationsCount', tenantId, token],
    queryFn: async () => {
      if (!tenantId) return 0;
      const res = await getUnreadCount(tenantId, token);
      return res?.data?.count ?? 0;
    },
    enabled: !!tenantId && !!token,
  });

  // Setup Real-time WebSockets
  useEffect(() => {
    if (!token || !subdomain) return;

    // Resolve socket url based on the backend base url
    const beUrl = process.env.NEXT_PUBLIC_BE || 'http://localhost:5000/api';
    const socketUrl = beUrl.replace(/\/api\/?$/, '');

    const socket = io(socketUrl, {
      transports: ['websocket'],
      query: {
        slug: subdomain,
        token: token,
      },
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('Successfully connected to notification gateway');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      console.log('Disconnected from notification gateway');
    });

    socket.on('notification:new', (newNotif: INotification) => {
      console.log('Received real-time notification:', newNotif);

      // Invalidate react query cache
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });

      // Toast notification
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-teal-600`}
          style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px', zIndex: 9999 }}
        >
          <div style={{ fontSize: '20px' }}>🔔</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#0f766e', fontSize: '14px' }}>{newNotif.title}</p>
            <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '13px' }}>{newNotif.message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      ), { duration: 5000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, subdomain, queryClient]);

  const markAsRead = async (id: string) => {
    if (!tenantId) return;
    try {
      await apiMarkAsRead(id, tenantId, token);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!tenantId) return;
    try {
      await apiMarkAllAsRead(tenantId, token);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const notifications = notificationsData ?? [];
  const unreadCount = unreadCountData ?? 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        socketConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
