const { pinyin } = require('pinyin-pro')
const BaseController = require('./baseController')
const { Partner, Product } = require('../models')


class SuggestionController extends BaseController {
    matchSort = (array, keyword) => {
        return array.filter(content => 
            content.includes(keyword) ||
            pinyin(content, { pattern: 'first', toneType: 'none', type: 'array' }).join('').includes(keyword) ||
            pinyin(content, { toneType: 'none', type: 'array' }).join('').includes(keyword)
        ).sort((a, b) => a.length - b.length)
    }

    partnerNameIndex = async (req, res, next) => {
        try {
            const partners = await Partner.findAll({ attributes: ['name'] })
            const results = this.matchSort(partners.map(p => p.name), req.query.keyword)
            return res.json(results)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    productMaterialIndex = async (req, res, next) => {
        try {
            const products = await Product.findAll({ 
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('material')), 'material']]
            })
            const results = this.matchSort(products.map(p => p.material), req.query.keyword)
            return res.json(results)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    productNameIndex = async (req, res, next) => {
        try {
            const products = await Product.findAll({ 
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('name')), 'name']]
            })
            const results = this.matchSort(products.map(p => p.name), req.query.keyword)
            return res.json(results)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    productSpecIndex = async (req, res, next) => {
        try {
            const products = await Product.findAll({ 
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('spec')), 'spec']]
            })
            const results = this.matchSort(products.map(p => p.spec), req.query.keyword)
            return res.json(results)
        } catch (error) {
            return this.handleError(res, error)
        }
    }
}


module.exports = SuggestionController