'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Vendor {
  id: string;
  name: string;
  score: number;
  rating: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

interface VendorLeaderboardProps {
  topPerformers: Vendor[];
  bottomPerformers: Vendor[];
}

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'A': return 'bg-green-500';
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-yellow-500';
    case 'D': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return { name: 'ArrowTrendingUpIcon', color: 'text-green-600' };
    case 'down': return { name: 'ArrowTrendingDownIcon', color: 'text-red-600' };
    case 'stable': return { name: 'MinusIcon', color: 'text-gray-600' };
    default: return { name: 'ArrowTrendingUpIcon', color: 'text-green-600' };
  }
};

const VendorLeaderboard = ({ topPerformers, bottomPerformers }: VendorLeaderboardProps) => {
  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
  const vendors = activeTab === 'top' ? topPerformers : bottomPerformers;

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Vendor Performance</h3>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('top')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'top' ? 'bg-[#383838] text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            Top Performers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bottom')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bottom' ? 'bg-[#383838] text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            Need Attention
          </button>
        </div>
      </div>

      {/* Vendor list */}
      <div className="divide-y divide-border">
        {vendors.map((vendor, index) => {
          const trendIcon = getTrendIcon(vendor.trend);

          return (
            <div
              key={vendor.id}
              className="p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 && activeTab === 'top' ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-text-secondary'
                }`}
                >
                  {index + 1}
                </div>

                {/* Vendor info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/vendor_management?vendor=${vendor.id}`}
                      className="font-medium text-text-primary hover:text-primary transition-colors truncate"
                    >
                      {vendor.name}
                    </Link>
                    <Icon name={trendIcon.name} size={14} className={trendIcon.color} />
                  </div>
                  <p className="text-xs text-text-secondary">{vendor.category}</p>
                </div>

                {/* Score and rating */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-text-primary">
                    {vendor.score.toFixed(1)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getRatingColor(vendor.rating)}`}>
                    {vendor.rating}
                  </span>
                  <Link
                    href={`/vendor_management?vendor=${vendor.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="ArrowRightIcon" size={16} className="text-text-secondary" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link
          href="/vendor_management"
          className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all vendors
          <Icon name="ArrowRightIcon" size={14} />
        </Link>
      </div>
    </div>
  );
};

export default VendorLeaderboard;
