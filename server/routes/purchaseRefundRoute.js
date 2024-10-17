const express = require('express')
const router = express.Router()

const { purchaseRefundController } = require('../controllers')
const { validateRefund } = require('../middlewares/validate')
const { filterInvoices } = require('../middlewares/filter')


router.get('/', purchaseRefundController.index, filterInvoices)
router.get('/:id', purchaseRefundController.show)
router.post('/', validateRefund, purchaseRefundController.store)
router.put('/:id', validateRefund, purchaseRefundController.update)
router.delete('/:id', purchaseRefundController.destroy)

module.exports = router