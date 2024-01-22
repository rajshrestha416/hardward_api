const CategoryController = require("../controllers/category.controller");
const { verifyUser } = require("../middlewares/auth.middlerware");

const router = require("express").Router()
const categoryController = new CategoryController()

router.post('/', categoryController.addCategory)

router.get('/', categoryController.getCategories)

router.get('/:id', categoryController.getCategory)

router.put('/:id', categoryController.updateCategory)

router.delete('/:id', categoryController.deleteCategory)


module.exports = router