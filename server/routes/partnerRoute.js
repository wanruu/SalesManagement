const express = require('express')
const router = express.Router()

const { partnerController } = require('../controllers')
const { validatePartner } = require('../middlewares/validate')
const { filterPartners } = require('../middlewares/filter')


router.get('/', partnerController.index, filterPartners)
router.get('/:name', partnerController.show)
router.post('/', validatePartner, partnerController.store)
router.put('/:name', validatePartner, partnerController.update)
router.delete('/:name', partnerController.destroy)


module.exports = router