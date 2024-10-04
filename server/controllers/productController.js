const BaseController = require('./baseController')
const { Product, InvoiceItem, sequelize } = require('../models')


class ProductController extends BaseController {
    index = async (req, res, next) => {
        try {
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
                ]
            }
            const products = await Product.findAll(options)
            return res.send(products)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    show = async (req, res, next) => {
        try {
            var params = req.params
            if (params.hasOwnProperty('material') && params.material == undefined) {
                params.material = ""
            }
            const options = {
                where: params,
                include: {
                    model: InvoiceItem,
                    as: 'invoiceItems'
                },
                // order: [
                //     [{ model: InvoiceItem, as: 'invoiceItems'}, 'id', 'DESC']
                // ]
            }
            
            const product = await Product.findOne(options)
            if (!product) {
                return this.handleNotFound(res)
            }
            const invoiceItems = product.dataValues.invoiceItems
            var totalWeight = 0
            var totalQuantity = 0
            for (const invoiceItem of invoiceItems) {
                if (invoiceItem.weight != null) {
                    totalQuantity += invoiceItem.quantity
                    totalWeight += invoiceItem.weight
                }
            }
            
            const newProduct = product.dataValues
            newProduct.invoiceItemNum = invoiceItems.length
            newProduct.unitWeight = totalQuantity == 0 ? null : totalWeight / totalQuantity
            return res.send(newProduct)
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
                const newProduct = await Product.findOne(options)
                return this.handleCreated(res, newProduct)
            }
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    destroy = async (req, res, next) => {
        try {
            const options = { where: { id: req.params.id }}
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