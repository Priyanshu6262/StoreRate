import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../validations/schemas';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login, getDashboardRouteForRole } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await login(data);
      success(`Welcome back, ${user.name}!`);
      const targetRoute = getDashboardRouteForRole(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      toastError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Enter your registered email and password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="name@example.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Credentials for Reviewers */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Demo Logins:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('admin@storerate.com', 'Admin@1234')}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition truncate"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('owner1@storerate.com', 'Owner@1234')}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition truncate"
          >
            Store Owner
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('user1@storerate.com', 'User@1234')}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition truncate"
          >
            Normal User
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Sign up as a Normal User
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
