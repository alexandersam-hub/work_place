const UserModel = require('../../models/UserModel')
const tokenService = require('./TokenService')
const UserDto = require('../../dtos/UserDto')
const bcrypt = require('bcrypt')
const ErrorService = require('../ErrorService')

class AuthServices {

    async login(login, password) {
        try{
            const user = await UserModel.findOne({username: login})
            if(!user)
                return {warning: true, message: "Пользователь не найден"}
            if (!user.isActive)
                return {warning: true, message: "Пользователь заблокирован"}
            //const isPassEquals = bcrypt.compareSync(password, user.password)
            const isPassEquals = password === user.password
            if (isPassEquals) {
                const userDto = new UserDto(user)
                const newToken = tokenService.generationToken({...userDto})
                await tokenService.tokenSave(userDto.id, newToken)
                return {
                    warning: false,
                    data:{
                        token: newToken
                    }
                }
            }
            return {warning: true, message: 'Неверный пароль'}
        }catch (e){
            await ErrorService.saveErrorMessage('AuthServices/login', e.message)
            return {warning: false, message:'Ошибка сервера'}
        }

    }

}

module.exports = new AuthServices()