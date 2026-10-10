import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminCreateUserSchema } from '../../validations/schemas';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { UserPlus, ArrowLeft, User, Mail, Lock, MapPin } from 'lucide-react';

const AdminCreateUserPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      address: '',
      role: 'USER',
    },
    mode: 'onChange',
  });

  const nameValue = watch('name') || '';
  const addressValue = watch('address') || '';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await adminService.createUser(data);
      success('User created successfully!');
      navigate('/admin/users');
    } catch (err) {
      toastError(err.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/users"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create System User</h1>
          <p className="text-sm text-slate-500">
            Add a new Admin, Store Owner, or Normal User to the platform.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Input
              label="Full Name"
              icon={User}
              placeholder="e.g. Richard Hendricks Platform Lead"
              error={errors.name?.message}
              required
              {...register('name')}
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
              <span>Must be between 20 and 60 characters</span>
              <span className={nameValue.length < 20 || nameValue.length > 60 ? 'text-amber-500' : 'text-emerald-600'}>
                {nameValue.length}/60
              </span>
            </div>
          </div>

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="newuser@example.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Select
            label="System Role"
            required
            error={errors.role?.message}
            options={[
              { value: 'USER', label: 'Normal User (Can browse & submit store ratings)' },
              { value: 'STORE_OWNER', label: 'Store Owner (Can access store dashboard & view ratings)' },
              { value: 'ADMIN', label: 'System Administrator (Full platform control)' },
            ]}
            {...register('role')}
          />

          <div>
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute top-2.5 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  placeholder="Street, locality, city, state (maximum 400 characters)..."
                  className={`w-full rounded-lg border bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.address
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                  {...register('address')}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.address.message}</p>
              )}
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                <span>Maximum 400 characters</span>
                <span className={addressValue.length > 400 ? 'text-rose-500' : 'text-slate-400'}>
                  {addressValue.length}/400
                </span>
              </div>
            </div>
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="8-16 chars, 1 uppercase, 1 special symbol"
              error={errors.password?.message}
              required
              {...register('password')}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Must be 8–16 characters with at least 1 uppercase letter and 1 special symbol
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/admin/users">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={UserPlus}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUserPage;
