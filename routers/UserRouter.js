const {Router} = require('express')
const userController = require('../controllers/UserController')

const router = new Router()

router.post('/get_all_users', userController.getAllUsers)
router.post('/remove_user', userController.removeUser)
router.post('/update_user', userController.updateUser)
router.post('/create_user', userController.createUser)
router.post('/change_user_password', userController.updateUserPassword)

module.exports = router