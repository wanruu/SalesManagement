const { Model, DataTypes } = require('sequelize')
const sequelize = require('./sequelizeIndex').sequelize


class Partner extends Model {
    static attributes = {
        name: {
            type: DataTypes.TEXT,
            primaryKey: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        phone: {
            type: DataTypes.TEXT
        },
        address: {
            type: DataTypes.TEXT
        },
        folder: {
            type: DataTypes.TEXT
        }
    }
}

Partner.init(Partner.attributes, { sequelize })

module.exports = Partner