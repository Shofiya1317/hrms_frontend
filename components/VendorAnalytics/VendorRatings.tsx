/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';
import { VendorRatingsResponse } from '@/lib/interface/IVendor.interface';
import { TaskService } from '@/lib/service';
import { CHART_ORDERED_PALETTE } from '../ui/ChartColors';

interface VendorData {
  name: string;
  overall: number;
  emissions: number;
  social: number;
  governance: number;
  legal: number;
  rating: string;
  change: number;
}

interface CategoryLeader {
  category: string;
  leader: string;
  score: number;
}

interface RatingDistribution {
  rating: string;
  count: number;
  color: string;
}

type Theme = {
  id: string;
  name: string;
};

const VendorRatings = ({
  apiKey,
  token,
}: {
  apiKey: string;
  token: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [ratingsData, setRatingsData] = useState<VendorRatingsResponse | null>(
    null,
  );
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | undefined>(
    undefined,
  );

  const fetchThemes = useCallback(async () => {
    try {
      const res = await TaskService.getStandardThemes(apiKey, token);
      const themeData = res?.data ?? res;

      setThemes(themeData || []);
    } catch {
      setThemes([]);
    }
  }, [apiKey, token]);

  const fetchVendorRatings = useCallback(async () => {
    try {
      const filters = {
        limit: 100,
        ...(selectedTheme
          ? { themeId: [selectedTheme] } // when theme selected
          : { sortBy: 'overall' }), // when no theme
      };

      const res = await TaskService.getVendorRating(apiKey, token, filters);

      setRatingsData(res?.data ?? res);
      setIsLoading(false);
    } catch {
      setRatingsData(null);
    }
  }, [apiKey, token, selectedTheme]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  useEffect(() => {
    fetchVendorRatings();
  }, [fetchVendorRatings]);

  if (isLoading || !ratingsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      {/* <div className="flex items-center gap-4 flex-wrap"> */}
      {/* <span className="text-sm font-medium text-text-secondary">
          Sort by:
        </span> */}

      {/* <div className="flex gap-2 flex-wrap"> */}
      {/* Overall Button */}
      {/* <button
            type="button"
            onClick={() => setSelectedTheme(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedTheme
                ? 'bg-[#383838] text-white'
                : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            Overall Score
          </button> */}

      {/* Dynamic Theme Buttons */}
      {/* {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTheme === theme.id
                  ? 'bg-[#383838] text-white'
                  : 'bg-muted text-text-secondary hover:bg-muted/80'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div> */}
      {/* </div> */}

      {/* Top Performers Leaderboard */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Icon name="TrophyIcon" size={20} className="text-yellow-600" />
          Top Performing Vendors
        </h3>

        <div className="space-y-3">
          {ratingsData.topPerformingVendors.map((vendor) => (
            <div
              key={vendor.vendorId}
              className="flex items-center justify-between p-4 bg-muted/30
    rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="flex items-center justify-center w-10
        h-10 rounded-full bg-primary/10 text-[#383838] font-bold"
                >
                  #
                  {vendor.rank}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-text-primary">
                    {vendor.vendorName}
                  </div>

                  {/* ⭐ DYNAMIC THEME SCORES */}
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {vendor?.themeScores?.map((theme) => (
                      <span
                        key={theme.themeName}
                        className="text-xs text-text-secondary"
                      >
                        {theme.themeName}
                        :
                        {theme.score}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-text-primary">
                    {vendor.overallScore}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Overall Score
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-lg font-semibold ${
                    vendor.rating?.startsWith('A')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {vendor.rating}
                </div>

                <div
                  className={`flex items-center gap-1 ${
                    vendor.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <Icon
                    name={
                      vendor.trend >= 0
                        ? 'ArrowTrendingUpIcon'
                        : 'ArrowTrendingDownIcon'
                    }
                    size={16}
                  />
                  <span className="text-sm font-medium">
                    {vendor.trend > 0 ? '+' : ''}
                    {vendor.trend}
                    %
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Comparison Chart */}
      {/* <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-[16px] font-semibold text-text-primary mb-4">
          Top Vendors vs Industry Average
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={ratingsData.radarComparison}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="GreenTech Solutions"
              dataKey="GreenTech Solutions"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Radar
              name="EcoSupply Inc."
              dataKey="EcoSupply Inc."
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Radar
              name="Industry Average"
              dataKey="Industry Avg"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.3}
            />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div> */}

      {/* Category Leaders and Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Leaders */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Category Leaders
          </h3>

          <div className="space-y-3">
            {ratingsData.categoryLeaders.map((leader) => (
              <div
                key={leader.vendorId}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {leader.indicatorName}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {leader.vendorName}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="StarIcon" size={16} className="text-yellow-500" />
                  <span className="text-lg font-bold text-text-primary">
                    {leader.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className=" bg-white rounded-lg border border-border p-6">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">
            Rating Distribution
          </h3>
          <div className="mb-5 border-t border-border" />

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingsData.ratingDistribution}>
              {/* ✅ Gradients */}
              <defs>
                {CHART_ORDERED_PALETTE.map((color, index) => (
                  <linearGradient
                    key={index}
                    id={`ratingGrad${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color.base} />
                    <stop offset="100%" stopColor={color.gradient} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                horizontal
                vertical={false}
                stroke="#E4E7EC"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="rating"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                label={{
                  value: 'Vendor Count',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip cursor={{ fill: 'transparent' }} />

              <Bar
                dataKey="vendorCount"
                name="Number of Vendors"
                radius={[6, 6, 0, 0]}
              >
                {ratingsData.ratingDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#ratingGrad${index % CHART_ORDERED_PALETTE.length})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 w-full">
            {ratingsData.ratingDistribution.map((item, index: number) => (
              <div
                key={item.rating}
                className="flex items-center justify-between w-full"
              >
                {/* Left side — Rating */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_ORDERED_PALETTE[
                          index % CHART_ORDERED_PALETTE.length
                        ].base,
                    }}
                  />
                  <span className="text-sm text-text-secondary">
                    Rating
                    {' '}
                    {item.rating}
                  </span>
                </div>

                {/* Right side — Count */}
                <span className="text-sm font-semibold text-text-primary">
                  {item.vendorCount}
                  {' '}
                  vendors
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50
      rounded-lg border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <Icon name="LightBulbIcon" size={24}
          className="text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-md font-semibold text-text-primary mb-2">
            Performance Insights
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircleIcon" size={16}
                className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  GreenTech Solutions leads across most categories with
                  consistent A+ rating
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircleIcon" size={16}
                className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  Top 5 vendors show 3-5% improvement over the last
                  reporting period
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircleIcon" size={16}
                className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  67% of vendors maintain B+ rating or higher, indicating
                  strong portfolio health
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default VendorRatings;
