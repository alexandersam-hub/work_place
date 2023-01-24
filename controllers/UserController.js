const userService = require('../services/users/UserService')
const ErrorService = require("../services/ErrorService");


class UserController {

    async getAllUsers(req,res) {
        try{
            const result = await userService.getAllUsers()
            return res.json(result)
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserController/getAllUsers', e.message)
            return res.json({warning:true, message:'Ошибка получения пользователей'})
        }
    }

    async removeUser(req,res){
        try{
            const {id} = req.body
            if(id){
                const result = await userService.removeUser(id)
                return res.json(result)
            }
            else return res.json({warning:true, message:'не передано поле Id'})
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserController/removeUser', e.message)
            return res.json({warning:true, message:'Пользователь не удален'})
        }
    }

    async createUser(req,res){
        try{
            const {user} = req.body

            if(user.username && user.password && user.role){
                const result = await userService.createUser(user)
                return res.json(result)
            }
            else{
                return res.json({warning:true, message:`Пользователь не все поля заполнены верно`})
            }
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserController/createUser', e.message)
            return res.json({warning:true, message:`Ошибка сервера`})
        }
    }

    async updateUser(req,res){
        try{
            const {user} = req.body
            if(user){
                const result = await userService.updateUser(user.id, user)
                return res.json(result)
            }
            else{
                return res.json({warning:true, message:`Пользователь не изменен`})
            }
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserController/updateUser', e.message)
            return res.json({warning:true, message:`Пользователь не изменен. Ошибка сервера`})
        }
    }

    async updateUserPassword(req,res,next){
        try{
            const {id, password} = req.body
            if(id && password){
                const result = await userService.updateUserPassword(id, password)
                return res.json(result)
            }
            else{
                return res.json({warning:true, message:`Заполнены не все поля`})
            }
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserController/updateUserPassword', e.message)
            return res.json({warning:true, message:`Ошибка сервера`})
        }
    }




}

module.exports = new UserController()