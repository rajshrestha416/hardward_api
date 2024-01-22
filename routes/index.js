const router = require("express").Router()

router.use('/user', require("./user.route"))
router.use('/category', require("./category.route"))
router.use('/product', require("./product.route"))


module.exports = router