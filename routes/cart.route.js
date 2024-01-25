const CartController = require("../controllers/cart.controller");
const { verifyUser } = require("../middlewares/auth.middlerware");

const router = require("express").Router()
const cartController = new CartController()

router.post('/add', verifyUser, cartController.addToCart)

router.get('/my-cart', verifyUser, cartController.getMyCart)

router.put('/checkout/:cart_id', verifyUser, cartController.checkout)

router.put('/remove-item', verifyUser, cartController.removeItems)


module.exports = router