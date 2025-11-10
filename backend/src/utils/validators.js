import Joi from 'joi';

export const chatMessageSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
  conversationId: Joi.string().uuid().optional(),
  context: Joi.object({
    destination: Joi.string().max(100).optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional(),
    budgetInr: Joi.number().min(1000).max(10000000).optional(),
    adults: Joi.number().integer().min(1).max(20).optional(),
    children: Joi.number().integer().min(0).max(20).optional(),
    interests: Joi.array().items(Joi.string().valid(
      'history', 'nature', 'beaches', 'food', 'nightlife',
      'spirituality', 'adventure', 'shopping'
    )).optional(),
    otherInterests: Joi.string().max(500).optional(),
    hotelClass: Joi.string().valid('budget', 'mid-range', 'luxury').optional(),
    diet: Joi.string().valid('any', 'vegetarian', 'vegan', 'halal', 'non-veg').optional(),
  }).optional(),
});

export const validateChatMessage = (data) => {
  const { error, value } = chatMessageSchema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
  }
  return value;
};
