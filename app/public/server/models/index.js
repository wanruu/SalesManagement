const sequelize = require('./sequelizeIndex').sequelize

const Partner = require('./partner')
const Product = require('./product')
const InvoiceItem = require('./invoiceItem')
const Invoice = require('./invoice')


// Partner(1) - Invoice(M)
Partner.hasMany(Invoice, { 
    foreignKey: 'partnerName',
    as: 'invoices',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Invoice.belongsTo(Partner, {
    foreignKey: 'partnerName',
    as: 'partner'
})


// Order(1) - Refund(1)
Invoice.hasOne(Invoice, {
    foreignKey: 'orderId',
    as: 'refund',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Invoice.belongsTo(Invoice, {
    foreignKey: 'orderId',
    as: 'order'
})


// Invoice(1) - InvoiceItem(M)
Invoice.hasMany(InvoiceItem, {
    foreignKey: 'invoiceId',
    as: 'invoiceItems',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
InvoiceItem.belongsTo(Invoice, {
    foreignKey: 'invoiceId',
    as: 'invoice'
})


// Product(1) - InvoiceItem(M)
Product.hasMany(InvoiceItem, {
    foreignKey: 'productId',
    as: 'invoiceItems',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
InvoiceItem.belongsTo(Product, { 
    foreignKey: 'productId', 
    as: 'product'
})


// Automatically create all tables
sequelize.sync({ force: false }).then(function () {
    console.log("Database Configured")
})


module.exports = { 
    Partner, Product, sequelize, Invoice, InvoiceItem
}
