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
    static async findOrCreateByInfo(productList, returnOriginWithProductId=true) {
        // Find or Build
        const productPairs = await Promise.all(
            productList.map((item) => {
                return Product.findOrBuild({
                    where: { material: item.material, name: item.name, spec: item.spec },
                    defaults: { unit: item.unit }
                })
            })
        )
        // Save
        for (const [product, created] of productPairs) {
            if (created) {
                await product.save()
            }
        }
        const products = productPairs.map(([product, _]) => product.get())
        // Update Origin
        if (returnOriginWithProductId) {
            const invoiceItems = productList.map((item) => {
                const product = products.find((p) => p.material==item.material && p.name==item.name && p.spec==item.spec)
                item.productId = product.id
                return item
            })
            return invoiceItems
        }
        return products
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