import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Calendar } from 'lucide-react';
import { MetricDetailsModal } from './MetricDetailsModal';
import { analyticsService } from '../../../services/analyticsService';
import { BusinessMetricCard } from './BusinessMetricCard';
import { RecommendationCard } from './RecommendationCard';
import { HealthScoreCard } from './HealthScoreCard';
import { formatPrice } from '../../../utils/formatPrice';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState('30'); // Default to 30 days

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardMetrics(dateRange);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const days = parseInt(e.target.value);
    setSelectedDays(e.target.value);
    setDateRange({
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4 max-w-[2000px] mx-auto">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const { metrics: keyMetrics, topItems, insights } = metrics;

  // Prepare business metrics
  const businessMetrics = [
    {
      title: 'Total Revenue',
      value: formatPrice(keyMetrics.totalRevenue),
      icon: DollarSign,
      trend: '+12%',
      color: 'text-green-500'
    },
    {
      title: 'Total Orders',
      value: keyMetrics.totalOrders,
      icon: ShoppingBag,
      trend: '+5%',
      color: 'text-blue-500'
    },
    {
      title: 'Average Order Value',
      value: formatPrice(keyMetrics.averageOrderValue),
      icon: TrendingUp,
      trend: '+8%',
      color: 'text-purple-500'
    },
    {
      title: 'Total Reservations',
      value: keyMetrics.totalReservations || '0',
      icon: Calendar,
      trend: '+15%',
      color: 'text-orange-500'
    },
    {
      title: 'Table Utilization',
      value: `${keyMetrics.tableUtilization || '0'}%`,
      icon: Users,
      trend: '+3%',
      color: 'text-indigo-500'
    },
    {
      title: 'Avg. Party Size',
      value: keyMetrics.averagePartySize ? keyMetrics.averagePartySize.toFixed(1) : '0',
      icon: Users,
      trend: '+2%',
      color: 'text-teal-500'
    }
  ];

  // Prepare recommendations based on insights
  const recommendations = insights.map(insight => ({
    title: insight.type.charAt(0).toUpperCase() + insight.type.slice(1),
    message: insight.message,
    priority: insight.priority,
    metric: insight.metric,
    details: insight.details,
    viewAllLink: insight.viewAllLink
  }));

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[2000px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-serif text-orange-600">Business Performance</h1>
        <select 
          className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500"
          value={selectedDays}
          onChange={handleDateRangeChange}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Key Performance Indicators */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1 h-8 bg-blue-500 rounded"></div>
          <h2 className="text-xl font-semibold text-blue-900">Key Performance Indicators</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6">
          {businessMetrics.map((metric, index) => (
            <BusinessMetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Business Intelligence */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1 h-8 bg-purple-500 rounded"></div>
          <h2 className="text-xl font-semibold text-purple-900">Business Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard key={index} {...recommendation} />
          ))}
        </div>
      </div>

      {/* Dining Room Management */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1 h-8 bg-green-500 rounded"></div>
          <h2 className="text-xl font-semibold text-green-900">Dining Room Management</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <HealthScoreCard 
            title="Seating Efficiency"
            score={keyMetrics.seatingEfficiency.score}
            trend={keyMetrics.seatingEfficiency.trend}
            details="High table turnover rate"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Seating Efficiency',
                data: keyMetrics.seatingEfficiency.details
              });
              setIsModalOpen(true);
            }}
          />
          <HealthScoreCard 
            title="Reservation Success"
            score={keyMetrics.reservationSuccess.score}
            trend={keyMetrics.reservationSuccess.trend}
            details="Low no-show rate"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Reservation Success',
                data: keyMetrics.reservationSuccess.details
              });
              setIsModalOpen(true);
            }}
          />
          <HealthScoreCard 
            title="Space Optimization"
            score={keyMetrics.spaceOptimization.score}
            trend={keyMetrics.spaceOptimization.trend}
            details="Efficient table assignments"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Space Optimization',
                data: keyMetrics.spaceOptimization.details
              });
              setIsModalOpen(true);
            }}
          />
          <HealthScoreCard 
            title="Guest Experience"
            score={keyMetrics.guestExperience.score}
            trend={keyMetrics.guestExperience.trend}
            details="High satisfaction with service"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Guest Experience',
                data: keyMetrics.guestExperience.details
              });
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Kitchen Performance */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1 h-8 bg-orange-500 rounded"></div>
          <h2 className="text-xl font-semibold text-orange-900">Kitchen Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <HealthScoreCard 
            title="Financial Health"
            score={keyMetrics.financialHealth.score}
            trend={keyMetrics.financialHealth.trend}
            details="Strong revenue growth"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Financial Health',
                data: keyMetrics.financialHealth.details
              });
              setIsModalOpen(true);
            }}
          />
          <HealthScoreCard 
            title="Menu Analytics"
            score={keyMetrics.menuAnalytics.score}
            trend={keyMetrics.menuAnalytics.trend}
            details="Strong item performance"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Menu Analytics',
                data: keyMetrics.menuAnalytics.details
              });
              setIsModalOpen(true);
            }}
          />
          <HealthScoreCard 
            title="Order Satisfaction"
            score={keyMetrics.orderSatisfaction.score}
            trend={keyMetrics.orderSatisfaction.trend}
            details="High completion rate"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Order Satisfaction',
                data: keyMetrics.orderSatisfaction.details
              });
              setIsModalOpen(true);
            }}
          />
          <HealthScoreCard 
            title="Kitchen Efficiency"
            score={keyMetrics.kitchenEfficiency.score}
            trend={keyMetrics.kitchenEfficiency.trend}
            details="Peak hour optimization needed"
            onViewDetails={() => {
              setSelectedMetric({
                title: 'Kitchen Efficiency',
                data: keyMetrics.kitchenEfficiency.details
              });
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Metric Details Modal */}
      <MetricDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMetric?.title}
        data={selectedMetric?.data}
      />
    </div>
  );
}
