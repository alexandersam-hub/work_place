const LocationService = require('../services/games/LocationService')
const ErrorService = require("../services/ErrorService");

class LocationController{

    async createLocation(req,res){
        try{
            const {location} = req.body
            if(location){
                const result = await LocationService.createLocation(location)
                return res.json(result)
            }else
                return res.json({warning:true, message:'Поля location не заполнены'})

        }catch (e){
            await ErrorService.saveErrorMessage('LocationController/createLocation', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

    async getLocations(req,res){
        try{
            const result = await LocationService.getLocations()
            return res.json(result)
        }catch (e){
            await ErrorService.saveErrorMessage('LocationController/getLocations', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

    async updateLocation(req,res){
        try{
            const {location} = req.body
            if(location && location.id){
                const result = await LocationService.updateLocation(location.id, location)
                return res.json(result)
            }else
                return res.json({warning:true, message:'Поля location не заполнены'})

        }catch (e){
            await ErrorService.saveErrorMessage('LocationController/updateLocation', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }

    async removeLocation(req,res){
        try{
            const {id} = req.body
            if(id){
                const result = await LocationService.removeLocation(id)
                return res.json(result)
            }else
                return res.json({warning:true, message:'Поле id не заполнено'})

        }catch (e){
            await ErrorService.saveErrorMessage('LocationController/removeLocation', e.message)
            return res.json({warning:true, message:'Ошибка сервера'})
        }
    }
}

module.exports = new LocationController()