/* eslint-disable max-len */

'use client';

// import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface CategoryBreakdownChartProps {
  data: Array<{
    category: string;
    score: number;
    count: number;
  }>;
  currentRating: string;
  onRatingChange: (rating: string) => void;
}

const getRatingColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getRatingLabel = (score: number) => {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

const CategoryBreakdownChart = ({ data, currentRating, onRatingChange }: CategoryBreakdownChartProps) => {
  // const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const maxScore = 100;
  const overallAvg = data.length > 0
    ? data.reduce((sum, cat) => sum + cat.score, 0) / data.length
    : 0;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Category Breakdown</h3>
          <p className="text-sm text-text-secondary mt-1">
            Performance analysis by vendor category
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentRating}
              onChange={(e) => onRatingChange(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 bg-muted/50 border border-transparent rounded-lg text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted transition-colors"
            >
              <option value="all">All Ratings</option>
              <option value="A">A Rating</option>
              <option value="B">B Rating</option>
              <option value="C">C Rating</option>
              <option value="D">D Rating</option>
            </select>
            <Icon
              name="StarIcon"
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
            <Icon
              name="ChevronDownIcon"
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
          <Icon name="ChartBarIcon" size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No category data available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((category) => {
            const widthPercent = (category.score / maxScore) * 100;

            return (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-text-secondary">
                    (
                    {category.count}
                    {' '}
                    vendors)
                  </span>
                  <div className="flex items-center gap-3 justify-between ml-auto">
                    <span className="text-sm font-semibold text-text-primary">
                      {category.score.toFixed(1)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getRatingColor(category.score)}`}>
                      {getRatingLabel(category.score)}
                    </span>
                  </div>
                </div>

                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${getRatingColor(category.score)} transition-all duration-500`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>

                {/* {isExpanded && (
                  <div className="ml-6 mt-3 p-4 bg-muted/50 rounded-lg space-y-2 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Total Vendors:</span>
                        <span className="ml-2 font-semibold text-text-primary">{category.count}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Avg Score:</span>
                        <span className="ml-2 font-semibold text-text-primary">{category.score.toFixed(1)}</span>
                      </div>
                    </div>
                    <button type="button" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                      View detailed analysis
                      <Icon name="ArrowRightIcon" size={14} />
                    </button>
                  </div>
                )} */}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Overall Performance:</span>
          <span className="font-semibold text-text-primary">
            {overallAvg.toFixed(1)}
            {' '}
            / 100
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryBreakdownChart;
