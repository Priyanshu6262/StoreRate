const { z } = require('zod');
const { passwordRegex } = require('./auth.validator');

const createUserSchema = z.object({
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
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .optional()
    .or(z.literal('')),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .regex(
      passwordRegex,
      'Password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character'
    ),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
    required_error: 'Role is required and must be ADMIN, USER, or STORE_OWNER',
  }),
});

module.exports = {
  createUserSchema,
};
