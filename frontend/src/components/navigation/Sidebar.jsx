import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Store,
  KeyRound,
  LogOut,
  Star,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Manage Users', icon: Users },
          { to: '/admin/users/create', label: 'Add User', icon: UserPlus },
          { to: '/admin/stores', label: 'Manage Stores', icon: Store },
          { to: '/change-password', label: 'Change Password', icon: KeyRound },
        ];
      case 'STORE_OWNER':
        return [
          { to: '/owner/dashboard', label: 'Store Ratings', icon: LayoutDashboard },
          { to: '/change-password', label: 'Change Password', icon: KeyRound },
        ];
      case 'USER':
      default:
        return [
          { to: '/user/dashboard', label: 'Browse Stores', icon: Star },
          { to: '/change-password', label: 'Change Password', icon: KeyRound },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-200 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-base">StoreRate</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
          <nav className="space-y-1.5">
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {user?.role === 'ADMIN' ? 'Administration' : user?.role === 'STORE_OWNER' ? 'Store Portal' : 'User Portal'}
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User info & Logout */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
