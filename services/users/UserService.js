const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const UserDto = require("../../dtos/UserDto");
const ErrorService = require("../ErrorService");

class UserService{

    async getAllUsers(){
        try{
            const users = await UserModel.find()
            const userDto = []
            if(!users){
                return  {warning:true, data: {users:[]}}
            }
            users.forEach((item)=>{
                const user = new UserDto(item)
                // delete(user.password)
                userDto.push(user)
            })
            return  {warning:false, data: {users: userDto}}
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserService/getAllUsers', e.message)
            return {warning:true, messageRu:'Ошибка записи в базу данных'}
        }
    }

    async removeUser(userId){
        try {
            await UserModel.findByIdAndDelete(userId)

            return {warning:false, data:{id:userId}, message:'Пользователь удален'}
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserService/removeUser', e.message)
            return {warning:true, message:'Ошибка базы данных при удалении'}
        }
    }

    async createUser(user){
        try {
            const candidate = await UserModel.findOne({username:user.username})
            if(candidate)
                return {warning:true, message:'Пользователь с таким именем существует'}
            // user.password = bcrypt.hashSync(user.password,7)
            const newUser = await UserModel.create({...user})
            return {warning:false, data:{user:new UserDto(newUser)}}
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserService/createUser', e.message)
            return {warning:true, message:'Ошибка записи в базу данных'}
        }
    }

    async updateUser(userId, userDto){
    try {
        const user = await UserModel.findById(userId)
        if(!user)
            return {warning:true, message:'Пользователь не найден'}
        // userDto.password = user.password
        await UserModel.findByIdAndUpdate(userId, userDto)
        return {warning:false, message:' пользователя изменен'}
    }
    catch (e) {
        await ErrorService.saveErrorMessage('UserService/updateUser', e.message)
        return {warning:true, message:'Ошибка записи в базу данных'}
    }
}

    async updateUserPassword(userId, newPassword){
        try {
            // const cashPassword = bcrypt.hashSync(newPassword,7)
            const user = await UserModel.findById(userId)
            if(!user)
                return {warning:true, message:'Пользователь не найден'}
            //user.password = cashPassword
            user.password = newPassword
            await user.save()
            return {warning:false, message:'Пароль пользователя изменен'}
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserService/updateUserPassword', e.message)
            return {warning:true, messageRu:'Ошибка записи в базу данных'}
        }

    }

    async getUserById(userId){
        try {
            const user = await UserModel.findById(userId)
            if(!user)
                return {warning:true, message:'Пользователь не найден'}

            return {warning:false, data:{user:{...new UserDto(user)}}}
        }
        catch (e) {
            await ErrorService.saveErrorMessage('UserService/getUserById', e.message)
            return {warning:true, messageRu:'Ошибка чтения из базы данных'}
        }
    }

}

module.exports = new UserService()