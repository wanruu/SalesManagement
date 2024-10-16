const express = require('express')
const router = express.Router()

const { productController } = require('../controllers')
const { validateProduct } = require('../middlewares/validate')
const { filterProducts } = require('../middlewares/filter')

router.get('/', productController.index, filterProducts)
router.get('/:id', productController.show)
router.get('/:material?/:name/:spec', productController.show)
router.post('/', validateProduct, productController.store)
router.put('/:id', validateProduct, productController.update)
router.delete('/:id', productController.destroy)


module.exports = router