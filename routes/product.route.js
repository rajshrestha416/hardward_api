const ProductController = require("../controllers/product.controller");
const { verifyUser } = require("../middlewares/auth.middlerware");

const router = require("express").Router()
const productController = new ProductController()

router.post('/', productController.addProduct)

router.get('/', productController.getProducts)

router.get('/:sku', productController.getProduct)

router.put('/:id', productController.updateProduct)

router.delete('/:id', productController.deleteProduct)

module.exports = router