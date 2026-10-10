import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminCreateStoreSchema } from '../../validations/schemas';
import { adminService } from '../../services/admin.service';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import RatingStars from '../../components/common/RatingStars';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { Store, Plus, Building2, Mail, MapPin, User } from 'lucide-react';

const AdminStoresPage = () => {
  const { success, error: toastError } = useToast();
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isLoading, setIsLoading] = useState(true);

  // Add store modal state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getStores({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });
      setStores(res.stores);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Fetch available owners for store creation
  const handleOpenAddStore = async () => {
    setIsAddStoreOpen(true);
    try {
      const res = await adminService.getUsers({ role: 'STORE_OWNER', limit: 100 });
      setOwners(res.users);
    } catch (err) {
      console.error('Failed to fetch owners:', err);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: storeErrors },
  } = useForm({
    resolver: zodResolver(adminCreateStoreSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      owner_id: '',
    },
  });

  const onSubmitStore = async (data) => {
    setIsSubmittingStore(true);
    try {
      await adminService.createStore(data);
      success('Store registered successfully!');
      setIsAddStoreOpen(false);
      reset();
      fetchStores();
    } catch (err) {
      toastError(err.message || 'Failed to create store');
    } finally {
      setIsSubmittingStore(false);
    }
  };

  const handleSort = (field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  };

  const columns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            {val}
          </div>
          {row.owner && (
            <p className="text-xs text-slate-400 mt-0.5">
              Owner: <span className="text-slate-600 font-medium">{row.owner.name}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-700">{val}</span>,
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-xs" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col">
          <RatingStars value={row.average_rating || 0} showNumber size="sm" />
          <span className="text-[11px] text-slate-400 mt-0.5">
            {row.total_ratings || 0} review{row.total_ratings === 1 ? '' : 's'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor registered stores, physical addresses, and consumer ratings.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenAddStore}
          className="w-fit"
        >
          Add New Store
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Search by store name, email, or address..."
        />
      </div>

      {/* Stores Table */}
      <Table
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyText="No stores registered"
        emptyDescription="Stores added to the platform will appear here."
      />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        title="Add New Store"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitStore)} className="space-y-4">
          <Input
            label="Store Name"
            icon={Building2}
            placeholder="e.g. Phoenix Gourmet Hub"
            error={storeErrors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label="Store Contact Email"
            type="email"
            icon={Mail}
            placeholder="contact@store.com"
            error={storeErrors.email?.message}
            required
            {...register('email')}
          />

          <Select
            label="Assigned Store Owner"
            required
            error={storeErrors.owner_id?.message}
            options={[
              { value: '', label: '-- Select a Store Owner --' },
              ...owners.map((o) => ({
                value: o.id,
                label: `${o.name} (${o.email})`,
              })),
            ]}
            {...register('owner_id')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Physical Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute top-2.5 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                placeholder="Full physical street address..."
                className={`w-full rounded-lg border bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  storeErrors.address
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
                {...register('address')}
              />
            </div>
            {storeErrors.address && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{storeErrors.address.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddStoreOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmittingStore}
            >
              Save Store
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStoresPage;
