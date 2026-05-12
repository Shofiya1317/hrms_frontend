/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-use-before-define */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface QuestionLevelAnalysisProps {
  filters: any;
}

const QuestionLevelAnalysis = ({ filters }: QuestionLevelAnalysisProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('emissions');

  useEffect(() => {
    fetchChartData();
  }, [filters, selectedCategory]);

  const fetchChartData = async () => {
    setIsLoading(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });

    // Mock histogram data
    const mockData = [
      { question: 'Q1', responses: 45, completion: 92 },
      { question: 'Q2', responses: 38, completion: 78 },
      { question: 'Q3', responses: 52, completion: 95 },
      { question: 'Q4', responses: 41, completion: 84 },
      { question: 'Q5', responses: 48, completion: 88 },
      { question: 'Q6', responses: 35, completion: 72 },
      { question: 'Q7', responses: 50, completion: 91 },
      { question: 'Q8', responses: 43, completion: 86 },
    ];

    setChartData(mockData);
    setIsLoading(false);
  };

  const categories = [
    { id: 'emissions', label: 'Emissions Questions' },
    { id: 'social', label: 'Social Questions' },
    { id: 'governance', label: 'Governance Questions' },
    { id: 'legal', label: 'Legal Questions' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Question Response Distribution & Completion Rates
        </h3>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="responses"
              fill="#3b82f6"
              name="Response Count"
            />
            <Bar
              yAxisId="right"
              dataKey="completion"
              fill="#10b981"
              name="Completion %"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon
                name="DocumentTextIcon"
                size={20}
                className="text-blue-600"
              />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Total Questions</div>
              <div className="text-2xl font-bold text-text-primary">
                {chartData.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon
                name="CheckCircleIcon"
                size={20}
                className="text-green-600"
              />
            </div>
            <div>
              <div className="text-sm text-text-secondary">
                Avg Completion Rate
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {(
                  chartData.reduce((acc, item) => acc + item.completion, 0)
                  / chartData.length
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="UsersIcon" size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Avg Responses</div>
              <div className="text-2xl font-bold text-text-primary">
                {(
                  chartData.reduce((acc, item) => acc + item.responses, 0)
                  / chartData.length
                ).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionLevelAnalysis;
