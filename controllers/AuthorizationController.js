const AuthorizationService = require('../services/users/AuthorizationService')
const ErrorService = require("../services/ErrorService");

class AuthorizationController {

    async login(req,res){
        try{
            const {username, password} = req.body
            const result = await AuthorizationService.login(username, password)
            return res.json(result)
        }
        catch (e) {
            await ErrorService.saveErrorMessage('AuthorizationController/login', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }
}

module.exports = new AuthorizationController()