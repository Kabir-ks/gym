import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

const Overview = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    todayAttendance: 0,
    monthlyRevenue: 0,
    paymentStats: {
      dueToday: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      upcoming: { count: 0, amount: 0 },
      monthlyCollection: 0,
      expectedMonthly: 0,
      collectionRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Members",
      value: stats.activeMembers,
      icon: UserCheck,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { paymentStats } = stats;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon
                    className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Overview */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="text-primary-600" />
          Payment Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-900">Due Today</p>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {paymentStats.dueToday.count}
            </p>
            <p className="text-sm text-red-600 mt-1">
              ₹{paymentStats.dueToday.amount.toFixed(2)}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm font-medium text-orange-900">Overdue</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {paymentStats.overdue.count}
            </p>
            <p className="text-sm text-orange-600 mt-1">
              ₹{paymentStats.overdue.amount.toFixed(2)}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-900">
                Upcoming (7d)
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-700">
              {paymentStats.upcoming.count}
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              ₹{paymentStats.upcoming.amount.toFixed(2)}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Collection Rate
              </p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {paymentStats.collectionRate}%
            </p>
            <p className="text-sm text-green-600 mt-1">
              ₹{paymentStats.monthlyCollection.toFixed(2)} / ₹
              {paymentStats.expectedMonthly.toFixed(2)}
            </p>
          </div>
        </div>

        {(paymentStats.dueToday.count > 0 ||
          paymentStats.overdue.count > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>Action Required:</strong> You have{" "}
              {paymentStats.dueToday.count + paymentStats.overdue.count}{" "}
              payment(s) that need attention.
              <a
                href="/admin/dashboard/payments"
                className="text-primary-600 hover:text-primary-700 ml-2 font-medium"
              >
                Collect Payments →
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/dashboard/members"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Users className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Members</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add, edit, or view members
            </p>
          </a>
          <a
            href="/admin/dashboard/payments"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <DollarSign className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Collect Payments</h3>
            <p className="text-sm text-gray-600 mt-1">
              Record and track payments
            </p>
          </a>
          <a
            href="/admin/dashboard/nutrition"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900">
              Nutrition Calculator
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Calculate member macros
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Overview;
