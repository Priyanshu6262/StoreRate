import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import StatCard from '../../components/common/StatCard';
import ErrorState from '../../components/common/ErrorState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { Users, Store, Star, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform statistics across users, stores, and submitted ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </Link>
        </div>
      </div>

      {/* 3 Main Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 p-6 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="indigo"
            subtext="Registered system accounts"
          />
          <StatCard
            title="Total Stores"
            value={stats.totalStores}
            icon={Store}
            color="emerald"
            subtext="Stores listed on platform"
          />
          <StatCard
            title="Total Ratings"
            value={stats.totalRatings}
            icon={Star}
            color="amber"
            subtext="Cumulative consumer reviews"
          />
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">User Management</h3>
            <p className="text-sm text-slate-500 mt-1">
              Browse, filter, search, sort, and inspect detailed profiles for Normal Users, Store Owners, and Admins.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/admin/users"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5"
            >
              Go to Users Directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Store className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Directory</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Store Management</h3>
            <p className="text-sm text-slate-500 mt-1">
              Track store performance, average consumer ratings, physical addresses, and store owner affiliations.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/admin/stores"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
            >
              Go to Stores Directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
