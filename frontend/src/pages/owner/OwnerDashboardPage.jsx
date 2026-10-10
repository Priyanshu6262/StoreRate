import React, { useState, useEffect, useCallback } from 'react';
import { ownerService } from '../../services/owner.service';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatRating } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import RatingStars from '../../components/common/RatingStars';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import ErrorState from '../../components/common/ErrorState';
import { Store, Star, Users, Calendar, MapPin, Building2, BarChart2 } from 'lucide-react';

const OwnerDashboardPage = () => {
  const { error: toastError } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch Dashboard summary
  const fetchDashboard = useCallback(async () => {
    setIsLoadingDashboard(true);
    try {
      const data = await ownerService.getDashboard(selectedStoreId);
      setDashboardData(data);
      if (!selectedStoreId && data.store) {
        setSelectedStoreId(data.store.id);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load store dashboard');
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [selectedStoreId, toastError]);

  // Fetch Ratings table
  const fetchRatings = useCallback(async () => {
    setIsLoadingRatings(true);
    try {
      const res = await ownerService.getRatings({
        storeId: selectedStoreId,
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });
      setRatings(res.ratings);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load ratings list:', err);
    } finally {
      setIsLoadingRatings(false);
    }
  }, [selectedStoreId, pagination.page, pagination.limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleSort = (field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  };

  const columns = [
    {
      key: 'name',
      label: 'User Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.user?.name || 'Anonymous'}</p>
          {row.user?.address && (
            <p className="text-xs text-slate-400 truncate max-w-xs">{row.user.address}</p>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (_, row) => <span className="font-medium text-slate-700">{row.user?.email}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <RatingStars value={val} size="sm" />
          <span className="text-xs font-bold text-slate-800">{val} / 5</span>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Submitted Date',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(row.createdAt)}</span>
        </div>
      ),
    },
  ];

  if (isLoadingDashboard && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 p-6" />
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData?.store) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-8">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Store Assigned</h3>
        <p className="text-sm text-slate-500 mt-2">
          Your store owner account has not been linked to a store yet. Please contact the System Administrator to assign your store.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Store Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Store className="w-3.5 h-3.5" />
              Verified Store Owner Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {dashboardData.store.name}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {dashboardData.store.address}
          </p>
        </div>

        {/* Store Selector (if owner manages more than one store) */}
        {dashboardData.stores && dashboardData.stores.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Store:</span>
            <select
              value={selectedStoreId || ''}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-100"
            >
              {dashboardData.stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating Box (Section 13 requirement) */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">
              Average Store Rating
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold tracking-tight">
                {formatRating(dashboardData.averageRating)}
              </h2>
              <span className="text-lg text-indigo-200">/ 5</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-800/60">
            <RatingStars
              value={dashboardData.averageRating}
              size="md"
              className="justify-start"
            />
            <p className="text-xs text-indigo-300 mt-1">
              Calculated from {dashboardData.totalRatings} consumer review{dashboardData.totalRatings === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <StatCard
          title="Total Ratings Received"
          value={dashboardData.totalRatings}
          icon={Users}
          color="emerald"
          subtext="Verified customers who submitted feedback"
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ratings Breakdown
            </span>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1.5 mt-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dashboardData.ratingsDistribution?.[star] || 0;
              const percentage =
                dashboardData.totalRatings > 0
                  ? Math.round((count / dashboardData.totalRatings) * 100)
                  : 0;

              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-slate-500 font-medium">{star} ★</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-mono text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ratings History Table (Section 13) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-slate-500">
              Complete log of all ratings submitted exclusively for your store.
            </p>
          </div>

          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search by customer name or email..."
            className="w-full sm:w-72"
          />
        </div>

        <Table
          columns={columns}
          data={ratings}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isLoading={isLoadingRatings}
          emptyText="No ratings submitted yet"
          emptyDescription="Customer feedback for your store will show up here once submitted."
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
