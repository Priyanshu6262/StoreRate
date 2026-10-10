const { z } = require('zod');

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  address: z
    .string({ required_error: 'Address is required' })
    .max(400, 'Address must not exceed 400 characters')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .regex(
      passwordRegex,
      'Password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character'
    ),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

const changePasswordSchema = z
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
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation password do not match',
    path: ['confirmPassword'],
  });

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  passwordRegex,
};
