'use client';

import { useState } from 'react';
import Icon from '../ui/AppIcon';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  vendorName?: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'critical': return { name: 'ExclamationCircleIcon', color: 'text-red-600', bg: 'bg-red-50' };
    case 'warning': return { name: 'ExclamationTriangleIcon', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    case 'info': return { name: 'InformationCircleIcon', color: 'text-blue-600', bg: 'bg-blue-50' };
    default: return { name: 'InformationCircleIcon', color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter((alert) => alert.type === filter);

  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Alerts</h3>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                {criticalCount}
                {' '}
                critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                {warningCount}
                {' '}
                warning
              </span>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-[#383838] text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'critical' ? 'bg-red-600 text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'warning' ? 'bg-yellow-600 text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            Warning
          </button>
          <button
            type="button"
            onClick={() => setFilter('info')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'info' ? 'bg-blue-600 text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="CheckCircleIcon" size={48} className="text-green-500 mx-auto mb-2" />
            <p className="text-text-secondary text-sm">
              No
              {filter !== 'all' ? filter : ''}
              {' '}
              alerts
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAlerts.map((alert) => {
              const iconConfig = getAlertIcon(alert.type);

              return (
                <div
                  key={alert.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${iconConfig.bg} flex items-center justify-center`}>
                      <Icon name={iconConfig.name} size={18} className={iconConfig.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-text-primary">
                          {alert.title}
                        </h4>
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mb-2">
                        {alert.message}
                      </p>
                      {alert.vendorName && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Icon name="BuildingOfficeIcon" size={12} />
                          <span>{alert.vendorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* {filteredAlerts.length > 0 && (
        <div className="p-4 border-t border-border">
          <button type="button" className="w-full text-sm text-primary
          hover:text-primary/80 transition-colors">
            View all alerts
          </button>
        </div>
      )} */}
    </div>
  );
};

export default AlertsPanel;
