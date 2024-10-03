const express = require('express')
const router = express.Router()

const { purchaseOrderController } = require('../controllers')
const { validateOrder } = require('../middlewares/validate')


router.get('/', purchaseOrderController.index)
router.get('/:id', purchaseOrderController.show)
router.post('/', validateOrder, purchaseOrderController.store)
router.put('/:id', validateOrder, purchaseOrderController.update)
router.delete('/:id', purchaseOrderController.destroy)


module.exports = router