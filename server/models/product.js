const { Model, DataTypes } = require('sequelize')
const sequelize = require('./sequelizeIndex').sequelize


class Product extends Model {
    static attributes = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        material: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        spec: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        unit: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }
    static async bulkFindOrCreateByInfo(productList, options = {}) {
        const productPairs = await Promise.all(
            productList.map((item) => {
                return Product.findOrCreate({
                    where: { material: item.material, name: item.name, spec: item.spec },
                    defaults: { unit: item.unit },
                    ...options,
                })
            })
        )
        return productPairs.map(([product, _]) => product.get({ plain: true }))        
    }
}

Product.init(
    Product.attributes,
    {
        sequelize,
        indexes: [
            {
                unique: true,
                fields: ['material', 'name', 'spec']
            }
        ]
    }
)

module.exports = Product