import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { useDebounce } from '../../hooks/useDebounce';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import Filter from '../../components/common/Filter';
import Modal from '../../components/common/Modal';
import RatingStars from '../../components/common/RatingStars';
import Button from '../../components/common/Button';
import { UserPlus, Eye, Shield, Store, User as UserIcon, Building2, MapPin, Mail } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isLoading, setIsLoading] = useState(true);

  // User details modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        role: roleFilter,
        sortBy,
        sortOrder,
      });
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  };

  const handleViewDetails = async (user) => {
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const details = await adminService.getUserById(user.id);
      setSelectedUser(details);
    } catch (err) {
      setSelectedUser(user);
    } finally {
      setDetailsLoading(false);
    }
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Store className="w-3 h-3" />
            Store Owner
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <UserIcon className="w-3 h-3" />
            Normal User
          </span>
        );
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">{val}</p>
          <p className="text-xs text-slate-400 font-mono">ID: #{row.id}</p>
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
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => roleBadge(val),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, filter, sort, and manage system users across all roles.
          </p>
        </div>
        <Link
          to="/admin/users/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm w-fit"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Search by name, email, or address..."
        />

        <div className="flex items-center gap-3">
          <Filter
            label="Role"
            value={roleFilter}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'USER', label: 'Normal User' },
              { value: 'STORE_OWNER', label: 'Store Owner' },
            ]}
            onChange={(val) => {
              setRoleFilter(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        onRowClick={handleViewDetails}
        emptyText="No users found"
        emptyDescription="Try adjusting your search criteria or role filters."
      />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* User Details Modal (Section 9) */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="User Account Details"
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>
            Close
          </Button>
        }
      >
        {detailsLoading || !selectedUser ? (
          <div className="py-8 text-center text-sm text-slate-500 animate-pulse">
            Loading user profile...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                <div className="mt-1">{roleBadge(selectedUser.role)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <p className="text-sm font-medium text-slate-800 break-all">{selectedUser.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </span>
                <p className="text-sm font-medium text-slate-800">{selectedUser.address || 'N/A'}</p>
              </div>
            </div>

            {/* If user is Store Owner, display store details (Requirement 9) */}
            {selectedUser.role === 'STORE_OWNER' && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Associated Store Information
                  </h4>
                </div>

                {selectedUser.store ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-slate-900">{selectedUser.store.name}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{selectedUser.store.email}</p>
                        <p className="text-xs text-slate-500 mt-1">{selectedUser.store.address}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Average Rating</span>
                        <div className="mt-1">
                          <RatingStars
                            value={selectedUser.store.average_rating || 0}
                            showNumber
                            size="sm"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {selectedUser.store.total_ratings || 0} customer ratings
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    No store is currently linked to this owner.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
