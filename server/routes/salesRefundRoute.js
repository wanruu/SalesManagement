const express = require('express')
const router = express.Router()

const { salesRefundController } = require('../controllers')
const { validateRefund } = require('../middlewares/validate')
const { filterInvoices } = require('../middlewares/filter')


router.get('/', salesRefundController.index, filterInvoices)
router.get('/:id', salesRefundController.show)
router.post('/', validateRefund, salesRefundController.store)
router.put('/:id', validateRefund, salesRefundController.update)
router.delete('/:id', salesRefundController.destroy)


module.exports = router