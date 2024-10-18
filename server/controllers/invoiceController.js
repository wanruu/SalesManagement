const BaseController = require('./baseController')
const { Invoice, Partner, InvoiceItem, Product, sequelize } = require('../models')
const { Op } = require('sequelize')


class InvoiceController extends BaseController {
    constructor(type) {
        super()
        this.type = type
        this.isOrder = type.includes('Order')
    }

    index = async (req, res, next) => {
        try {
            const { startDate, endDate, number, sortBy='number', order='DESC' } = req.query

            // construct filter
            const conditions = {}
            if (startDate) {
                conditions.date = { [Op.gte]: startDate }
            }
            if (endDate) {
                if (startDate) {
                    conditions.date[Op.lte] = endDate
                } else {
                    conditions.date = { [Op.lte]: endDate }
                }
            }
            if (number) {
                conditions.number = { [Op.like]: `%${number}%` }
            }

            // query
            const options = {
                where: { type: this.type, ...conditions },
                include: [
                    {
                        model: InvoiceItem,
                        as: 'invoiceItems',
                        attributes: []
                    },
                    {
                        model: Invoice,
                        as: this.isOrder ? 'refund' : 'order',
                    }
                ],
                group: ['Invoice.id'],
                attributes: [
                    ...Object.keys(Invoice.attributes),
                    [sequelize.fn('IFNULL', sequelize.fn('SUM', sequelize.col('invoiceItems.delivered')), 0), 'deliveredItemNum'],
                    [sequelize.fn('COUNT', sequelize.col('invoiceItems.delivered')), 'totalItemNum']
                ],
                order: [[sortBy, order]]
            }
            const invoices = (await Invoice.findAll(options)).map(i => i.toJSON())
            invoices.forEach(invoice => {
                if (invoice.deliveredItemNum === invoice.totalItemNum) {
                    invoice.delivered = '全部配送'
                } else if (invoice.deliveredItemNum === 0) {
                    invoice.delivered = '未配送'
                } else {
                    invoice.delivered = '部分配送'
                }
                delete invoice.deliveredItemNum
                delete invoice.totalItemNum
            })
            req.invoices = invoices

            // complex filter in next
            next()
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    findById = async (id) => {
        const options = {
            include: [
                {
                    model: Partner,
                    as: 'partner'
                },
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                    include: {
                        model: Product,
                        as: 'product'
                    },
                },
                {
                    model: Invoice,
                    as: this.isOrder ? 'refund' : 'order',
                    include: {
                        model: InvoiceItem,
                        as: 'invoiceItems',
                        include: {
                            model: Product,
                            as: 'product',
                        }
                    }
                }
            ],
            where: {
                id: id,
                type: this.type
            },
            order: [
                [{ model: InvoiceItem, as: 'invoiceItems' }, 'id', 'ASC'],
                [{ model: Invoice, as: this.isOrder ? 'refund' : 'order' }, { model: InvoiceItem, as: 'invoiceItems' },'id', 'ASC']
            ]
        }
        const invoice = await Invoice.findOne(options)
        return invoice
    }

    show = async (req, res, next) => {
        try {
            const invoice = await this.findById(req.params.id)
            return res.send(invoice)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    destroy = async (req, res, next) => {
        try {
            const options = { where: { id: req.params.id, type: this.type } }
            const deletedCount = await Invoice.destroy(options)  // 0 or 1
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


module.exports = InvoiceController