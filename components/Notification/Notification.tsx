'use client';

import { useState } from 'react';
import { Bell, Search, Calendar, Clock, Megaphone, Users, FileText, AlertCircle } from 'lucide-react';

// Simplified notification type
type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  category: 'leave' | 'attendance' | 'announcement' | 'approval' | 'claim' | 'system';
};

// Category icon mapper
const CategoryIcon = ({ category }: { category: Notification['category'] }) => {
  const icons = {
    leave: Calendar,
    attendance: Clock,
    announcement: Megaphone,
    approval: Users,
    claim: FileText,
    system: AlertCircle,
  };
  const Icon = icons[category];
  return <Icon size={16} />;
};

// Format relative time
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export default function SimpleNotificationPage({ userRole = 'employee' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Notification['category'] | 'all'>('all');

  // Mock notifications
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Leave Request Approved',
      message: 'Your annual leave request for Dec 24-28 has been approved.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: 'leave',
    },
    {
      id: '2',
      title: 'New Announcement',
      message: 'Office will be closed on Dec 25-26 for Christmas holidays.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      category: 'announcement',
    },
    {
      id: '3',
      title: 'Timesheet Reminder',
      message: 'Please submit your November timesheet before Dec 5th.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: 'attendance',
    },
  ];

  const unreadCount = notifications.length;
  const stats = { total: notifications.length, unread: unreadCount };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="px-3 py-3 md:px-4 md:py-4">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">Stay updated with your HR activities</p>
      </div>

      <div className="mx-auto px-3 sm:px-4 md:px-5 py-3 sm:py-4">
        {/* Simple stats bar for admin */}
        {userRole === 'admin' && (
          <div className="mb-2">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  You have <span className="font-semibold text-teal-600">{stats.unread}</span> new notifications
                </p>
                <Bell className="text-teal-600" size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notifications List - Simple Messages */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-sm text-gray-500">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div key={notification.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-500">
                      <CategoryIcon category={notification.category} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}