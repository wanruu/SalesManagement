const InvoiceController = require('./invoiceController')
const { Invoice, InvoiceItem, Partner, Product } = require('../models')


class OrderController extends InvoiceController {
    store = async (req, res, next) => {
        try {
            const data = req.body
            // Partner
            await Partner.findOrCreate({ where: { name: data.partnerName } })
            // Invoice
            const invoiceNumber = await Invoice.getNextNumber(this.type, data.date)
            const delivered = this.getDeliveredStr(data.invoiceItems)
            const invoice = await Invoice.create({ ...data, number: invoiceNumber, type: this.type, delivered: delivered })
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
            const delivered = this.getDeliveredStr(data.invoiceItems)
            await Invoice.update({ ...data, delivered: delivered }, invoiceOptions)
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
        } catch (error) {
            return this.handleError(res, error)
        }
    }
}


module.exports = OrderController