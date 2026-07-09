'use client';

import React, { useState } from 'react';
import {
  Bell, Search, Calendar, Clock, Megaphone, Users, FileText, AlertCircle, Check, CheckCheck
} from 'lucide-react';
import { useNotifications } from '@/lib/context/NotificationContext';
import { INotification } from '@/lib/service/notification';
import { useRouter } from 'next/navigation';

// Category icon mapper
const CategoryIcon = ({ category }: { category: string }) => {
  const icons: Record<string, React.ComponentType<any>> = {
    leave: Calendar,
    attendance: Clock,
    announcement: Megaphone,
    approval: Users,
    claim: FileText,
    system: AlertCircle,
  };
  const Icon = icons[category] || AlertCircle;
  return <Icon size={16} />;
};

// Map backend reference_type to category for icons
const getCategoryFromNotification = (notif: INotification): 'leave' | 'attendance' | 'announcement' | 'approval' | 'claim' | 'system' => {
  if (!notif.reference_type) return 'system';
  const ref = notif.reference_type.toUpperCase();
  if (ref === 'LEAVE') return 'leave';
  if (ref === 'WFH' || ref === 'ON_DUTY' || ref === 'COMP_OFF' || ref === 'REGULARIZATION') return 'attendance';
  return 'system';
};

// Format relative time
const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function NotificationPage({ userRole = 'employee', userName = '' }) {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    
    const type = notif.type;
    let targetPath = '';

    if (type === 'LEAVE_REQUEST') {
      targetPath = '/employee/my-team';
    } else if (type === 'WFH_REQUEST') {
      targetPath = '/employee/my-team';
    } else if (type === 'ON_DUTY_REQUEST') {
      targetPath = '/employee/my-team';
    } else if (type === 'COMP_OFF_REQUEST') {
      targetPath = '/employee/my-team';
    } else if (type === 'ATTENDANCE_REGULARIZATION') {
      targetPath = '/employee/my-team';
    } else if (type === 'RESIGNATION_SUBMITTED') {
      targetPath = '/employee/my-team';
    } else if (type === 'LEAVE_APPROVED' || type === 'LEAVE_REJECTED') {
      targetPath = '/employee/attendance/apply-leave';
    } else if (type === 'WFH_APPROVED' || type === 'WFH_REJECTED') {
      targetPath = '/employee/attendance/wfh-request';
    } else if (type === 'ON_DUTY_APPROVED' || type === 'ON_DUTY_REJECTED') {
      targetPath = '/employee/attendance/on-duty';
    } else if (type === 'COMP_OFF_APPROVED' || type === 'COMP_OFF_REJECTED') {
      targetPath = '/employee/attendance/comp-off';
    } else if (type === 'ATTENDANCE_REGULARIZATION_APPROVED' || type === 'ATTENDANCE_REGULARIZATION_REJECTED') {
      targetPath = '/employee/attendance/regularization';
    } else if (type === 'PROBATION_CONFIRMED') {
      targetPath = '/employee/dashboard';
    } else if (type === 'RESIGNATION_APPROVED' || type === 'RESIGNATION_REJECTED') {
      targetPath = '/employee/attendance/resignation';
    }

    if (targetPath) {
      router.push(targetPath);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unread' && !notif.is_read) ||
      (statusFilter === 'read' && notif.is_read);

    const matchesSearch =
      searchQuery === '' ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-teal-600" size={22} />
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hi {userName}, stay updated with your HR activities
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Simple stats bar */}
        <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredNotifications.length} of {notifications.length} notifications
            {unreadCount > 0 && (
              <span> ({unreadCount} unread)</span>
            )}
          </div>
          <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'unread'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'read'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm font-medium text-slate-500">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const category = getCategoryFromNotification(notif);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 flex gap-4 transition-colors text-left relative ${
                      !notif.is_read
                        ? 'bg-teal-50/20 hover:bg-teal-50/40 cursor-pointer'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      !notif.is_read
                        ? 'bg-teal-50 text-teal-600 border border-teal-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <CategoryIcon category={category} />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <h3 className={`text-sm font-semibold text-slate-800 ${!notif.is_read ? 'font-bold' : ''}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(notif.created_at || (notif as any).createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Unread dot / Mark read tick button */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      {!notif.is_read ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="w-6 h-6 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600 flex items-center justify-center transition-colors"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
