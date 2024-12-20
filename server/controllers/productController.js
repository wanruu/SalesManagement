const BaseController = require('./baseController')
const { Product, InvoiceItem, sequelize, Invoice } = require('../models')
const { Op } = require('sequelize')


class ProductController extends BaseController {
    index = async (req, res, next) => {
        try {
            const { unit } = req.query

            // construct filter
            const conditions = {}
            if (unit) {
                conditions.unit = { [Op.in]: unit }
            }

            // query
            const options = {
                include: {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                    attributes: []
                },
                group: ['Product.id'],
                attributes: [
                    ...Object.keys(Product.attributes),
                    [sequelize.fn('COUNT', sequelize.col('invoiceItems.id')), 'invoiceItemNum']
                ],
                where: { ...conditions }
            }
            const products = await Product.findAll(options).then(products => products.map(p => p.get({ plain: true })))
            req.products = products

            // complex filter
            next()
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    show = async (req, res, next) => {
        try {
            // find by id or (material, name, spec)
            const where = {}
            if (req.params.hasOwnProperty('id')) {
                where.id = req.params.id
            } else {
                where.material = req.params.material ?? ''
                where.name = req.params.name
                where.spec = req.params.spec
            }

            const { sortBy = 'id', order = 'DESC', detail = false } = req.query

            if (detail) {
                const options = {
                    where: where,
                    include: [{
                        model: InvoiceItem,
                        as: 'invoiceItems',
                        include: {
                            model: Invoice,
                            as: 'invoice'
                        }
                    }],
                    order: [
                        [{ model: InvoiceItem, as: 'invoiceItems' }, sortBy, order]
                    ]
                }

                const product = await Product.findOne(options).then(p => p.get({ plain: true }))
                if (!product) {
                    return this.handleNotFound(res)
                }

                let totalWeight = 0
                let totalQuantity = 0
                for (const invoiceItem of product.invoiceItems) {
                    if (invoiceItem.weight != null) {
                        totalQuantity += invoiceItem.quantity
                        totalWeight += invoiceItem.weight
                    }
                }

                product.unitWeight = totalQuantity == 0 ? null : totalWeight / totalQuantity
                return res.send(product)
            } else {
                const product = await Product.findOne({ where: where }).then(p => p.get({ plain: true }))
                if (!product) {
                    return this.handleNotFound(res)
                }
                return res.send(product)
            }
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    store = async (req, res, next) => {
        try {
            const product = await Product.create(req.body)
            return this.handleCreated(res, product)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    update = async (req, res, next) => {
        try {
            const options = { where: { id: req.params.id } }
            const [affectedCount] = await Product.update(req.body, options)  // 0 or 1
            if (affectedCount == 0) {
                return this.handleNotFound(res)
            } else {
                const newProduct = await Product.findOne(options).then(p => p.get({ plain: true }))
                return this.handleCreated(res, newProduct)
            }
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    destroy = async (req, res, next) => {
        try {
            const options = { where: { id: req.params.id } }
            const deletedCount = await Product.destroy(options)  // 0 or 1
            if (deletedCount == 0) {
                return this.handleNotFound(res)
            } else {
                return this.handleDeleted(res)
            }
        } catch (error) {
            return this.handleError(res, error)
        }
    }
}


module.exports = ProductController