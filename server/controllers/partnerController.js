const { Op } = require('sequelize')
const BaseController = require('./baseController')
const { Partner, Invoice, InvoiceItem, Product } = require('../models')


class PartnerController extends BaseController {
    index = async (req, res, next) => {
        try {
            const { sortBy='name', order='ASC' } = req.query
            const options = {
                include: {
                    model: Invoice,
                    as: 'invoices',
                    attributes: ['type']
                },
                group: ['Partner.name'],
                order: [[sortBy, order]]
            }
            const partners = await Partner.findAll(options)
            partners.forEach(p => {
                const newPartner = p.dataValues
                newPartner.salesNum = p.invoices.filter(i => i.type.includes('sales')).length
                newPartner.purchaseNum = p.invoices.filter(i => i.type.includes('purchase')).length
                delete newPartner.invoices
            })
            req.partners = partners
            next()
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    show = async (req, res, next) => {
        try {
            const options = {
                include: {
                    model: Invoice,
                    as: 'invoices',
                    where: {
                        [Op.or]: [
                            { type: 'salesOrder' },
                            { type: 'purchaseOrder' }
                        ]
                    },
                    required: false,  // left join
                    include: [
                        {
                            model: InvoiceItem,
                            as: 'invoiceItems',
                            include: {
                                model: Product,
                                as: 'product',
                            }
                        },
                        {
                            model: Invoice,
                            as: 'refund',
                            include: {
                                model: InvoiceItem,
                                as: 'invoiceItems',
                                include: {
                                    model: Product,
                                    as: 'product',
                                }
                            },
                        },
                    ]
                }
            }
            const partner = await Partner.findByPk(req.params.name, options)
            return res.send(partner)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    store = async (req, res, next) => {
        try {
            const partner = await Partner.create(req.body)
            return this.handleCreated(res, partner)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    update = async (req, res, next) => {
        try {
            const options = { where: { name: req.params.name } }
            const [affectedCount] = await Partner.update(req.body, options)  // 0 or 1
            if (affectedCount == 0) {
                return this.handleNotFound(res)
            } else {
                const newPartner = await Partner.findByPk(req.body.name)
                return this.handleCreated(res, newPartner)
            }
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    destroy = async (req, res, next) => {
        try {
            const options = { where: { name: req.params.name }}
            const deletedCount = await Partner.destroy(options)  // 0 or 1
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


module.exports = PartnerController