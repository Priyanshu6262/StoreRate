const { z } = require('zod');

const createStoreSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name must not exceed 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Store email is required' })
    .email('Please enter a valid store email address')
    .trim()
    .toLowerCase(),
  address: z
    .string({ required_error: 'Store address is required' })
    .min(5, 'Store address must be at least 5 characters')
    .max(400, 'Store address must not exceed 400 characters')
    .trim(),
  owner_id: z.coerce
    .number({ required_error: 'Owner ID is required' })
    .int('Owner ID must be an integer')
    .positive('Owner ID must be valid'),
});

module.exports = {
  createStoreSchema,
};
