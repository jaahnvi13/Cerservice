const Joi=require('joi');

module.exports.carownerSchema=Joi.object({
    carowner:Joi.object({
        model: Joi.string().required(),
        year: Joi.number().required().min(2000),
        vin:Joi.string().required(),
        kmsdriven:Joi.number().required().min(0),
        dop:Joi.date().required(),
        owner: Joi.string().required(),
        contact: Joi.number().required(),
        email: Joi.string().required(),
        address: Joi.string().required(),
        createdOn:Joi.date().required()
    }).required()
});
