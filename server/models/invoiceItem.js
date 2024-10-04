const { Model, DataTypes } = require('sequelize')
const sequelize = require('./sequelizeIndex').sequelize


class InvoiceItem extends Model {
    static attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        quantity: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100,
            validate: {
                min: 0,
                max: 100
            }
        },
        weight: {
            type: DataTypes.DECIMAL
        },
        originalAmount: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        remark: {
            type: DataTypes.TEXT,
        },
        delivered: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
}


InvoiceItem.init(InvoiceItem.attributes, { sequelize })


module.exports = InvoiceItem