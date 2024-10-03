const express = require('express')
const router = express.Router()

const { partnerController } = require('../controllers')
const { validatePartner } = require('../middlewares/validate')


router.get('/', partnerController.index)
router.get('/:name', partnerController.show)
router.post('/', validatePartner, partnerController.store)
router.put('/:name', validatePartner, partnerController.update)
router.delete('/:name', partnerController.destroy)


module.exports = router