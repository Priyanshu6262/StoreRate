import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim(),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim(),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters')
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .regex(
      passwordRegex,
      'Password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character'
    ),
});

export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim(),
  address: z
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .regex(
      passwordRegex,
      'Password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character'
    ),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
    required_error: 'Role is required',
  }),
});

export const adminCreateStoreSchema = z.object({
  name: z
    .string()
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name must not exceed 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Store email is required')
    .email('Please enter a valid store email address')
    .trim(),
  address: z
    .string()
    .min(5, 'Store address must be at least 5 characters')
    .max(400, 'Store address must not exceed 400 characters')
    .trim(),
  owner_id: z.coerce
    .number({ required_error: 'Store owner is required' })
    .int('Owner ID must be an integer')
    .positive('Please select a valid store owner'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(16, 'New password must not exceed 16 characters')
      .regex(
        passwordRegex,
        'Password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation password do not match',
    path: ['confirmPassword'],
  });
