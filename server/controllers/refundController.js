const InvoiceController = require('./invoiceController')
const { Invoice, InvoiceItem, sequelize } = require('../models')


class RefundController extends InvoiceController {
    store = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const data = req.body
            // Invoice
            const invoiceNumber = await Invoice.getNextNumber(this.type, data.date)
            const delivered = this.getDeliveredStr(data.invoiceItems)
            const invoice = await Invoice.create({ ...data, number: invoiceNumber, type: this.type, delivered: delivered }, { transaction: t })
            // InvoiceItems
            const invoiceItemData = data.invoiceItems.map((item) => ({ ...item, invoiceId: invoice.id }))
            await InvoiceItem.bulkCreate(invoiceItemData, { transaction: t })
            // Return
            t.commit()
            return this.handleCreated(res, await this.findById(invoice.id))
        } catch (error) {
            t.rollback()
            return this.handleError(res, error)
        }
    }

    update = async (req, res, next) => {
        const t = await sequelize.transaction()
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
            await Invoice.update({ ...data, delivered: delivered }, { ...invoiceOptions, transaction: t })
            // InvoiceItems
            await InvoiceItem.destroy({ where: { invoiceId: invoiceId }, transaction: t })
            const invoiceItemData = data.invoiceItems.map((item) => ({ ...item, invoiceId: invoiceId }))
            await InvoiceItem.bulkCreate(invoiceItemData, { transaction: t })
            // Return
            t.commit()
            return this.handleCreated(res, await this.findById(invoiceId))
        } catch (error) {
            t.rollback()
            return this.handleError(res, error)
        }
    }
}


module.exports = RefundController