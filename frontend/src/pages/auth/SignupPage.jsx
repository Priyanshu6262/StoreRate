import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../validations/schemas';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, Mail, MapPin, Lock, UserPlus } from 'lucide-react';

const SignupPage = () => {
  const { register: authRegister, getDashboardRouteForRole } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
    },
    mode: 'onChange',
  });

  const nameValue = watch('name') || '';
  const addressValue = watch('address') || '';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await authRegister(data);
      success('Account created successfully! Welcome to StoreRate.');
      navigate(getDashboardRouteForRole(user.role), { replace: true });
    } catch (err) {
      toastError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Create User Account</h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Sign up as a normal user to explore and rate stores
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Full Name"
            icon={User}
            placeholder="e.g. Alexander Hamilton Customer"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
            <span>Minimum 20 and maximum 60 characters</span>
            <span className={nameValue.length < 20 || nameValue.length > 60 ? 'text-amber-500' : 'text-emerald-600'}>
              {nameValue.length}/60
            </span>
          </div>
        </div>

        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="your.email@example.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <div>
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute top-2.5 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                placeholder="Enter complete residential or office address..."
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
            placeholder="8-16 chars, 1 uppercase, 1 special"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Must be 8–16 characters with at least 1 uppercase letter and 1 special symbol
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={UserPlus}
        >
          Complete Registration
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
