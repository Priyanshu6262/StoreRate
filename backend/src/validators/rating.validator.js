const { z } = require('zod');

const ratingSchema = z.object({
  rating: z.coerce
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

module.exports = {
  ratingSchema,
};
