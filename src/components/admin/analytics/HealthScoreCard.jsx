import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function HealthScoreCard({ title, score, trend, details, onViewDetails }) {
  const isPositive = trend.startsWith('+');
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = isPositive ? 'text-green-500' : 'text-red-500';

  // Calculate color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  const scoreColor = getScoreColor(score);

  // Calculate background gradient based on score
  const getGradient = (score) => {
    if (score >= 90) return 'from-green-50 to-green-100';
    if (score >= 70) return 'from-orange-50 to-orange-100';
    return 'from-red-50 to-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-medium text-gray-600">{title}</h3>
        <div className={`flex items-center ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{trend}%</span>
        </div>
      </div>

      <div className="relative">
        {/* Score display */}
        <div className="flex items-baseline justify-center">
          <span className={`text-3xl sm:text-4xl font-bold ${scoreColor}`}>{score}</span>
          <span className="ml-1 text-sm text-gray-500">/100</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getGradient(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Score indicators */}
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Details */}
      <p className="mt-4 text-sm text-gray-600 text-center">{details}</p>

      {/* Quick actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <button 
          onClick={onViewDetails}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center"
        >
          View Details
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Score change indicator */}
      <div className="absolute top-2 right-2">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend}%
        </div>
      </div>
    </div>
  );
}
