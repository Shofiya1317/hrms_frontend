/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Vendor {
  id: string;
  name: string;
  rating: string;
  score: number;
}

interface MobileComparisonViewProps {
  vendors: Vendor[];
  categoryScores: Array<{ vendorId: string; category: string; score: number; status: string }>;
}

const MobileComparisonView = ({ vendors, categoryScores }: MobileComparisonViewProps) => {
  const [activeVendorIndex, setActiveVendorIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const activeVendor = vendors[activeVendorIndex];
  const vendorCategories = categoryScores.filter((s) => s.vendorId === activeVendor.id);
  const categories = Array.from(new Set(vendorCategories.map((s) => s.category)));

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => (prev.includes(category)
      ? prev.filter((c) => c !== category)
      : [...prev, category]));
  };

  const getRatingClass = (rating: string) => {
    if (rating === 'A') return 'bg-success/10 text-success';
    if (rating === 'B') return 'bg-primary/10 text-primary';
    if (rating === 'C') return 'bg-warning/10 text-warning';
    return 'bg-error/10 text-error';
  };

  const getScoreColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-success/10 text-success';
      case 'good': return 'bg-primary/10 text-primary';
      case 'fair': return 'bg-warning/10 text-warning';
      case 'poor': return 'bg-error/10 text-error';
      default: return 'bg-muted text-text-secondary';
    }
  };

  return (
    <div className="lg:hidden space-y-4">
      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setActiveVendorIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeVendorIndex === 0}
            className="p-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors duration-fast"
          >
            <Icon name="ChevronLeftIcon" size={20} />
          </button>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary">{activeVendor.name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingClass(activeVendor.rating)}`}>
                Rating
                {' '}
                {activeVendor.rating}
              </span>
              <span className="text-sm text-text-secondary">
                {activeVendor.score}
                %
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveVendorIndex((prev) => Math.min(vendors.length - 1, prev + 1))}
            disabled={activeVendorIndex === vendors.length - 1}
            className="p-2 rounded-md border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors duration-fast"
          >
            <Icon name="ChevronRightIcon" size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-1">
          {vendors.map((vendor, index) => (
            <button
              type="button"
              key={vendor.id}
              onClick={() => setActiveVendorIndex(vendors.indexOf(vendor))}
              className={`h-1.5 rounded-full transition-all duration-fast ${
                index === activeVendorIndex ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
              aria-label={`View vendor ${vendor.name}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-semibold text-text-primary">Category Scores</h4>
        </div>

        <div className="divide-y divide-border">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category);
            const categoryData = vendorCategories.filter((s) => s.category === category);

            return (
              <div key={category}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors duration-fast"
                >
                  <span className="text-sm font-medium text-text-primary">{category}</span>
                  <Icon
                    name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                    size={20}
                    className="text-text-secondary"
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {categoryData.map((item) => (
                      <div key={`${category}-${item.score}`} className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Score</span>
                        <span className={`px-3 py-1 rounded-md text-sm font-medium ${getScoreColor(item.status)}`}>
                          {item.score}
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileComparisonView;
