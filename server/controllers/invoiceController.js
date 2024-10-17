const BaseController = require('./baseController')
const { Invoice } = require('../models')


class InvoiceController extends BaseController {
    constructor(type) {
        super()
        this.type = type
    }

    index = async (req, res, next) => {
        try {
            const isOrder = this.type.includes('Order')
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
                        as: isOrder ? 'refund' : 'order',
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