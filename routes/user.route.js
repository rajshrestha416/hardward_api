const UserController = require("../controllers/user.controller");

const router = require("express").Router()
const userController = new UserController()

router.post('/login', userController.login)

router.post('/register', userController.register)

router.get('/all', userController.allUser)


// router.get('/my-profile', userController.allUser)

router.put('/update-profile/:id', userController.updateProfile)

router.delete('/delete-user/:id', userController.deleteUser)


module.exports = router