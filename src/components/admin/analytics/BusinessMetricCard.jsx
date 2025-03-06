import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function BusinessMetricCard({ title, value, icon: Icon, trend, color }) {
  const isPositive = trend.startsWith('+');
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex flex-col items-center space-y-4">
        {/* Header with Icon and Title */}
        <div className="flex items-center justify-center space-x-2 w-full">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600 text-center">{title}</h3>
        </div>

        {/* Metric Value */}
        <div className="flex flex-col items-center justify-center w-full">
          <div className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center">{value}</div>
          <div className="mt-1 text-sm text-gray-500 text-center">
            vs. previous period
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={`flex items-center justify-center ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-sm font-medium ml-1">{trend}</span>
        </div>

        {/* Micro Chart - To be implemented */}
        <div className="w-full h-10 mt-2">
          {/* Placeholder for future chart implementation */}
        </div>
      </div>
    </div>
  );
}
