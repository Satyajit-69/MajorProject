const Joi = require('joi');
module.exports.listingSchema = Joi.object({
   listing: Joi.object({
      title: Joi.string().required().messages({
        'string.empty': 'Title cannot be empty',
        'any.required': 'Title is required'
      }),
      description: Joi.string().required().messages({
        'string.empty': 'Description cannot be empty',
        'any.required': 'Description is required'
      }),
      location: Joi.string().required().messages({
        'string.empty': 'Location cannot be empty',
        'any.required': 'Location is required'
      }),
      country: Joi.string().required().messages({
        'string.empty': 'Country cannot be empty',
        'any.required': 'Country is required'
      }),
      price: Joi.number().required().min(0).messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
      })
   }).required()
});

module.exports.reviewsSchema = Joi.object ({
   review:Joi.object({
      rating:Joi.number().required().min(1).max(5),
      comment:Joi.string().required() ,
   }).required() 
})