const BaseController = require('./baseController')
const { Product, Partner, Invoice, InvoiceItem, sequelize } = require('../models')


class TestController extends BaseController {
    showInvoiceItems = async (req, res, next) => {
        const items = await InvoiceItem.findAll()
        return res.send(items)
    }

    destroy = async (req, res, next) => {
        await Invoice.destroy({ truncate: true })
        await InvoiceItem.destroy({ truncate: true })
        await Product.destroy({ truncate: true })
        await Partner.destroy({ truncate: true })
        await sequelize.query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='Products'")
        await sequelize.query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='InvoiceItems'")
        await sequelize.query("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='Invoices'")
        return res.end()
    }
}


module.exports = TestController