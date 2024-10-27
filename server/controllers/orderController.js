const InvoiceController = require('./invoiceController')
const { Invoice, InvoiceItem, Partner, Product, sequelize } = require('../models')


class OrderController extends InvoiceController {
    store = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const data = req.body
            // Partner
            await Partner.findOrCreate({ where: { name: data.partnerName }, transaction: t })
            // Invoice
            const invoiceNumber = await Invoice.getNextNumber(this.type, data.date)
            const delivered = this.getDeliveredStr(data.invoiceItems)
            const invoice = await Invoice.create({ ...data, number: invoiceNumber, type: this.type, delivered: delivered }, { transaction: t })
            // Product
            const products = await Product.bulkFindOrCreateByInfo(data.invoiceItems, { transaction: t })
            // InvoiceItems
            const invoiceItems = data.invoiceItems.map((item) => {
                const p = products.find(p => p.material == item.material && p.name == item.name && p.spec == item.spec)
                return { ...item, productId: p.id, invoiceId: invoice.id }
            })
            await InvoiceItem.bulkCreate(invoiceItems, { transaction: t })
            // Return
            await t.commit()
            return this.handleCreated(res, await this.findById(invoice.id))
        } catch (error) {
            await t.rollback()
            return this.handleError(res, error)
        }
    }

    update = async (req, res, next) => {
        const t = await sequelize.transaction()
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
            await Partner.findOrCreate({ where: { name: data.partnerName }, transaction: t })
            // Invoice
            const delivered = this.getDeliveredStr(data.invoiceItems)
            await Invoice.update({ ...data, delivered: delivered }, { ...invoiceOptions, transaction: t })
            await Invoice.update({ partnerName: data.partnerName }, { where: { orderId: invoiceId }, transaction: t })  // update refund if any
            // Product
            const products = await Product.bulkFindOrCreateByInfo(data.invoiceItems, { transaction: t })
            // InvoiceItems
            await InvoiceItem.destroy({ where: { invoiceId: invoiceId }, transaction: t })
            const invoiceItems = data.invoiceItems.map((item) => {
                const p = products.find(p => p.material == item.material && p.name == item.name && p.spec == item.spec)
                return { ...item, productId: p.id, invoiceId: invoice.id }
            })
            await InvoiceItem.bulkCreate(invoiceItems, { transaction: t })
            // Return
            await t.commit()
            return this.handleCreated(res, await this.findById(invoiceId))
        } catch (error) {
            await t.rollback()
            return this.handleError(res, error)
        }
    }
}


module.exports = OrderController