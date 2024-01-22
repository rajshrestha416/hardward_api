const router = require("express").Router()

router.use('/user', require("./user.route"))
router.use('/category', require("./category.route"))


module.exports = router