const OrderController = require("../controllers/category.controller");
const { verifyUser } = require("../middlewares/auth.middlerware");

const router = require("express").Router()
const orderController = new OrderController()

router.post('/', verifyUser, orderController.addToCart)

router.get('/', verifyUser, orderController.getCart)

router.post('/checkout', verifyUser, orderController.checkout)

router.put('/remove/:id', verifyUser, orderController.deleteCategory)


module.exports = router