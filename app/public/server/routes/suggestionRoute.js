const express = require('express')
const router = express.Router()


const { suggestionController } = require('../controllers')


router.get('/partners/names', suggestionController.partnerNameIndex)
router.get('/products/materials', suggestionController.productMaterialIndex)
router.get('/products/names', suggestionController.productNameIndex)
router.get('/products/specs', suggestionController.productSpecIndex)


module.exports = router