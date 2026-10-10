import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../../validations/schemas';
import { authService } from '../../services/auth.service';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';

const ChangePasswordPage = () => {
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.changePassword(data);
      success(res.message || 'Password changed successfully!');
      reset();
    } catch (err) {
      toastError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Change Password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            placeholder="Enter your current password"
            error={errors.currentPassword?.message}
            required
            {...register('currentPassword')}
          />

          <div>
            <Input
              label="New Password"
              type="password"
              icon={Lock}
              placeholder="8-16 chars, 1 uppercase, 1 special symbol"
              error={errors.newPassword?.message}
              required
              {...register('newPassword')}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Must be 8–16 characters with at least 1 uppercase letter and 1 special symbol
            </p>
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="Re-enter your new password"
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword')}
          />

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={CheckCircle2}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
