const jwt = require('jsonwebtoken')
const tokenModel = require('../../models/TokenModel')
const ErrorService = require("../ErrorService");

class TokenService{

    generationToken(payload){
        try{
            const newToken = jwt.sign(payload, process.env.SECRET_KEY_TOKEN, {expiresIn: '900d'} )
            return  newToken
        }catch (e) {
            ErrorService.saveErrorMessage('TokenService/generationToken', e.message)
            return null
        }

    }

    async tokenSave(userId, token){
        try{
            const tokenData = await tokenModel.findOne({user:userId})
            if(tokenData){
                tokenData.token = token
                await tokenData.save()
                return token
            }
            const newToken = await tokenModel.create({user:userId, token})
            return newToken
        }catch (e){
            await ErrorService.saveErrorMessage('TokenService/tokenSave', e.message)
            return null
        }
    }

    async removeToken(token){
       try{
           const tokenData = await tokenModel.deleteOne({token})
           return tokenData
       }catch (e) {
           await ErrorService.saveErrorMessage('TokenService/removeToken', e.message)
           return null
       }
    }

    validationToken(token){
        try{
            const userData=jwt.verify(token, process.env.SECRET_KEY_TOKEN)
            return userData
        }
        catch (e) {
            ErrorService.saveErrorMessage('TokenService/validationToken', e.message)
            return null
        }
    }
}

module.exports = new TokenService()