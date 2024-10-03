const BaseController = require('./baseController')
const { Invoice } = require('../models')


class InvoiceController extends BaseController {
    constructor(type) {
        super()
        this.type = type
    }

    destroy = async (req, res, next) => {
        try {
            const options = { where: { id: req.params.id, type: this.type } }
            const deletedCount = await Invoice.destroy(options)  // 0 or 1
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


module.exports = InvoiceController