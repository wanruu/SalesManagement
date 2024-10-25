const InvoiceController = require('./invoiceController')
const { Invoice, InvoiceItem } = require('../models')


class RefundController extends InvoiceController {
    store = async (req, res, next) => {
        try {
            const data = req.body
            // Invoice
            const invoiceNumber = await Invoice.getNextNumber(this.type, data.date)
            const delivered = this.getDeliveredStr(data.invoiceItems)
            const invoice = await Invoice.create({ ...data, number: invoiceNumber, type: this.type, delivered: delivered })
            // InvoiceItems
            const invoiceItemData = data.invoiceItems.map((item) => {
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
            delete data.partnerName
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

            // Invoice
            const delivered = this.getDeliveredStr(data.invoiceItems)
            await Invoice.update({ ...data, delivered: delivered }, invoiceOptions)
            // InvoiceItems
            await InvoiceItem.destroy({ where: { invoiceId: invoiceId } })
            const invoiceItemData = data.invoiceItems.map((item) => {
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


module.exports = RefundController