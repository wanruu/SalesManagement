const { Op } = require('sequelize')
const BaseController = require('./baseController')
const { Partner, Invoice, InvoiceItem, Product, sequelize } = require('../models')


class PartnerController extends BaseController {
    index = async (req, res, next) => {
        try {
            const { sortBy = 'name', order = 'ASC' } = req.query

            // Perf: wait for sequelize to support selecting from subQuery
            // https://github.com/sequelize/sequelize/issues/5354
            const salesNumQuery = `SELECT COUNT(id) AS salesNum 
            FROM Invoices AS Invoice
            WHERE Invoice.type LIKE 'sales%' AND Invoice.partnerName = Partner.name
            GROUP BY partnerName`
            const purchaseNumQuery = `SELECT COUNT(id) AS purchaseNum 
            FROM Invoices AS Invoice
            WHERE Invoice.type LIKE 'purchase%' AND Invoice.partnerName = Partner.name
            GROUP BY partnerName`

            const options = {
                attributes: {
                    include: [
                        [sequelize.literal(`(${salesNumQuery})`), 'salesNum'],
                        [sequelize.literal(`(${purchaseNumQuery})`), 'purchaseNum'],
                    ]
                },
                group: ['Partner.name'],
                order: [[sortBy, order]]
            }

            const partners = await Partner.findAll(options)
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
            const options = { where: { name: req.params.name } }
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