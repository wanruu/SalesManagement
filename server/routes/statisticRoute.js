const express = require('express')
const router = express.Router()

const { statisticController } = require('../controllers')


router.get('/', statisticController.index)
router.get('/:startDate/:endDate', statisticController.show)


module.exports = router