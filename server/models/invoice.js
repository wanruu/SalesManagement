const { Model, DataTypes, Op } = require('sequelize')
const sequelize = require('./sequelizeIndex').sequelize


class Invoice extends Model {
    static attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        number: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.TEXT,  // salesOrder/salesRefund/purchaseOrder/purchaseRefund
            allowNull: false
        },
        partnerName: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        date: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        prepayment: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: DataTypes.DECIMAL.ZEROFILL
        },
        payment: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: DataTypes.DECIMAL.ZEROFILL
        },
        orderId: {
            type: DataTypes.INTEGER
        }
    }

    static async getNextNumber(type, date) {
        // TODO: validate date
        const prefix = date.replaceAll('-', '')
        const maxNumberInvoice = await this.findOne({
            where: {
                number: { [Op.startsWith]: prefix },
                type: type
            },
            order: [['number', 'DESC']]
        })
        const lastIndex = maxNumberInvoice == null ? 0 : parseInt(maxNumberInvoice.number.slice(8))
        const nextNumber = prefix + (lastIndex + 1).toString().padStart(4, '0')
        return nextNumber
    }
}



Invoice.init(Invoice.attributes, { 
    sequelize,
    indexes: [{
        unique: true,
        fields: ['number', 'type']
    }]
})


module.exports = Invoice