const Joi = require('joi')


const productSchema = Joi.object({
    material: Joi.string().required().allow(""),
    name: Joi.string().required(),
    spec: Joi.string().required(),
    unit: Joi.string().required(),
})

const partnerSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().allow("").allow(null),
    address: Joi.string().allow("").allow(null),
    folder: Joi.string().allow("").allow(null),
})

const orderItemSchema = Joi.object({
    material: Joi.string().required().allow(""),
    name: Joi.string().required(),
    spec: Joi.string().required(),
    unit: Joi.string().required(),

    price: Joi.number().required(),
    discount: Joi.number().integer().min(0).max(100).required(),
    quantity: Joi.number().required(),
    weight: Joi.number().allow(null),
    originalAmount: Joi.number().required(),
    amount: Joi.number().required(),
    remark: Joi.string().allow(""),
    delivered: Joi.boolean().required(),
})

const refundItemSchema = Joi.object({
    productId: Joi.number().integer().required(),

    price: Joi.number().required(),
    discount: Joi.number().integer().min(0).max(100).required(),
    quantity: Joi.number().required(),
    weight: Joi.number().allow(null),
    originalAmount: Joi.number().required(),
    amount: Joi.number().required(),
    remark: Joi.string().allow(""),
    delivered: Joi.boolean().required(),
})

const orderSchema = Joi.object({
    partnerName: Joi.string().required(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    amount: Joi.number().required(),
    prepayment: Joi.number().required(),
    payment: Joi.number().required(),
    invoiceItems: Joi.array().items(orderItemSchema).required()
})

const refundSchema = Joi.object({
    partnerName: Joi.string().required(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    amount: Joi.number().required(),
    prepayment: Joi.number().required(),
    payment: Joi.number().required(),
    orderId: Joi.number().integer().required(),
    invoiceItems: Joi.array().items(refundItemSchema).required()
})

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ error: error.details[0].message })
    }
    next()
}

const validatePartner = (req, res, next) => {
    const { error } = partnerSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ error: error.details[0].message })
    }
    next()
}

const validateOrder = (req, res, next) => {
    const { error } = orderSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ error: error.details[0].message })
    }
    next()
}

const validateRefund = (req, res, next) => {
    const { error } = refundSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ error: error.details[0].message })
    }
    next()
}


module.exports = { validateProduct, validatePartner, validateOrder, validateRefund }