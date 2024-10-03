const express = require('express')
const router = express.Router()

const { salesOrderController } = require('../controllers')
const { validateOrder } = require('../middlewares/validate')


router.get('/', salesOrderController.index)
router.get('/:id', salesOrderController.show)
router.post('/', validateOrder, salesOrderController.store)
router.put('/:id', validateOrder, salesOrderController.update)
router.delete('/:id', salesOrderController.destroy)


module.exports = router