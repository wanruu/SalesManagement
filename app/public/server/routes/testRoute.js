const express = require('express')
const router = express.Router()

const { testController } = require('../controllers')

router.get('/invoiceItems', testController.showInvoiceItems)
router.delete('/destroy', testController.destroy)

module.exports = router