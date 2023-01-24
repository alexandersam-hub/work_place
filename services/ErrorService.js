const ErrorModel = require('../models/ErrorModel')
const ErrorDto = require('../dtos/ErrorDto')

class ErrorService{

    async saveErrorMessage(from, message){
        try{
            await ErrorModel.create({...new ErrorDto(from, message)})
            return true
        }catch (e){
            return false
        }
    }

}

module.exports = new ErrorService()