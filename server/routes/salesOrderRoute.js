const express = require('express')
const router = express.Router()

const { salesOrderController } = require('../controllers')
const { validateOrder } = require('../middlewares/validate')
const { filterInvoices } = require('../middlewares/filter')


router.get('/', salesOrderController.index, filterInvoices)
router.get('/:id', salesOrderController.show)
router.post('/', validateOrder, salesOrderController.store)
router.put('/:id', validateOrder, salesOrderController.update)
router.delete('/:id', salesOrderController.destroy)


module.exports = router