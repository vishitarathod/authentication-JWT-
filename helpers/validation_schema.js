const Joi=require('@hapi/joi');


const authSchema=Joi.object().keys({
    email:Joi.string().email().lowercase().required(),
    password:Joi.string().min(2).required()
})


module.exports={
    authSchema,
}