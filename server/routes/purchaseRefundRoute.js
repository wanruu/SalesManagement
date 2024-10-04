const express = require('express')
const router = express.Router()

const { purchaseRefundController } = require('../controllers')
const { validateRefund } = require('../middlewares/validate')


router.get('/', purchaseRefundController.index)
router.get('/:id', purchaseRefundController.show)
router.post('/', validateRefund, purchaseRefundController.store)
router.put('/:id', validateRefund, purchaseRefundController.update)
router.delete('/:id', purchaseRefundController.destroy)

module.exports = router