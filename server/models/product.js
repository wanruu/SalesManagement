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
        // bulk find
        const products = await Promise.all(
            productList.map((item) => {
                return Product.findOne({
                    where: { material: item.material, name: item.name, spec: item.spec }
                })
            })
        )
        // bulk create
        const missingProducts = productList.filter((_, index) => !products[index]).map(item => ({
            material: item.material, name: item.name, spec: item.spec, unit: item.unit,
        }))
        const createdProducts = await Product.bulkCreate(missingProducts, options)
        return [...(products.filter(p => p)), ...createdProducts]
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