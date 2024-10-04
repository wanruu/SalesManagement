const InvoiceController = require('./invoiceController')
const { Invoice, InvoiceItem, Partner, Product, sequelize } = require('../models')


class OrderController extends InvoiceController {
    index = async (req, res, next) => {
        try {
            const options = {
                where: { type: this.type },
                include: [
                    {
                        model: InvoiceItem,
                        as: 'invoiceItems',
                        attributes: []
                    },
                    {
                        model: Invoice,
                        as: 'refund'
                    }
                ],
                group: ['Invoice.id'],
                attributes: [
                    ...Object.keys(Invoice.attributes),
                    [sequelize.fn('IFNULL', sequelize.fn('SUM', sequelize.col('invoiceItems.delivered')), 0), 'deliveredItemNum'],
                    [sequelize.fn('COUNT', sequelize.col('invoiceItems.delivered')), 'totalItemNum']
                ]
            }
            const invoices = await Invoice.findAll(options)
            return res.send(invoices)
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
                    as: 'refund',
                    include: {
                        model: InvoiceItem,
                        as: 'invoiceItems',
                    }
                }
            ],
            where: {
                id: id,
                type: this.type
            },
            order: [
                [{ model: InvoiceItem, as: 'invoiceItems' }, 'id', 'ASC'],
                [{ model: Invoice, as: 'refund' }, { model: InvoiceItem, as: 'invoiceItems' },'id', 'ASC']
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

    store = async (req, res, next) => {
        try {
            const data = req.body
            // Partner
            await Partner.findOrCreate({ where: { name: data.partnerName } })
            // Invoice
            const invoiceNumber = await Invoice.getNextNumber(this.type, data.date)
            const invoice = await Invoice.create({ ...data, number: invoiceNumber, type: this.type })
            // Product
            var invoiceItemData = await Product.findOrCreateByInfo(data.invoiceItems)
            // InvoiceItems
            invoiceItemData = invoiceItemData.map((item) => {
                item.invoiceId = invoice.id
                return item
            })
            await InvoiceItem.bulkCreate(invoiceItemData)
            return this.handleCreated(res, await this.findById(invoice.id))
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    update = async (req, res, next) => {
        try {
            const invoiceId = req.params.id
            const data = req.body
            const invoiceOptions = {
                where: {
                    id: invoiceId,
                    type: this.type
                }
            }
            const invoice = await Invoice.findOne(invoiceOptions)
            if (!invoice) {
                return this.handleNotFound(res)
            }

            // Partner
            await Partner.findOrCreate({ where: { name: data.partnerName } })
            // Invoice
            await Invoice.update(data, invoiceOptions)
            await Invoice.update({ partnerName: data.partnerName }, { where: { orderId: invoiceId } })  // update refund if any
            // Product
            var invoiceItemData = await Product.findOrCreateByInfo(data.invoiceItems)
            // InvoiceItems
            await InvoiceItem.destroy({ where: { invoiceId: invoiceId } })
            invoiceItemData = invoiceItemData.map((item) => {
                item.invoiceId = invoiceId
                return item
            })
            await InvoiceItem.bulkCreate(invoiceItemData)
            return this.handleCreated(res, await this.findById(invoiceId))
        } catch(error) {
            return this.handleError(res, error)
        }
    }
}


module.exports = OrderController