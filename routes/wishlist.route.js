const CategoryController = require("../controllers/category.controller");
const { verifyUser } = require("../middlewares/auth.middlerware");

const router = require("express").Router()
const categoryController = new CategoryController()

router.post('/:product', verifyUser, categoryController.addCategory)

router.get('/', verifyUser, categoryController.getCategories)

// router.get('/:id', verifyUser, categoryController.getCategory)

router.put('/:id', verifyUser, categoryController.updateCategory)

router.delete('/:id', verifyUser, categoryController.deleteCategory)


module.exports = router