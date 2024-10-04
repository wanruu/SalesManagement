const { Op } = require('sequelize')
const BaseController = require('./baseController')
const { Partner, Invoice, sequelize } = require('../models')


class PartnerController extends BaseController {
    index = async (req, res, next) => {
        try {
            const options = {
                include: {
                    model: Invoice,
                    as: 'invoices',
                    attributes: []
                },
                group: ['Partner.name'],
                attributes: [
                    ...Object.keys(Partner.attributes),
                    [sequelize.fn('COUNT', sequelize.col('invoices.id')), 'invoiceNum']
                ],
                order: [
                    ['name', 'ASC']
                ]
            }
            const partners = await Partner.findAll(options)
            return res.send(partners)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    show = async (req, res, next) => {
        try {
            const options = {
                include: {
                    model: Invoice,
                    as: 'invoices',
                    where: {
                        [Op.or]: [
                            { type: 'salesOrder' },
                            { type: 'purchaseOrder' }
                        ]
                    },
                    required: false,  // left join
                    include: {
                        model: Invoice,
                        as: 'refund'
                    }
                }
            }
            const partner = await Partner.findByPk(req.params.name, options)
            return res.send(partner)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    store = async (req, res, next) => {
        try {
            const partner = await Partner.create(req.body)
            return this.handleCreated(res, partner)
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    update = async (req, res, next) => {
        try {
            const options = { where: { name: req.params.name } }
            const [affectedCount] = await Partner.update(req.body, options)  // 0 or 1
            if (affectedCount == 0) {
                return this.handleNotFound(res)
            } else {
                const newPartner = await Partner.findByPk(req.body.name)
                return this.handleCreated(res, newPartner)
            }
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    destroy = async (req, res, next) => {
        try {
            const options = { where: { name: req.params.name }}
            const deletedCount = await Partner.destroy(options)  // 0 or 1
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


module.exports = PartnerController