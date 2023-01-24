const ErrorService = require("../ErrorService");
const LocationModel = require('../../models/LocationModel')
const LocationDto = require('../../dtos/LocationDto')

class LocationService{

    async getLocationsByIds(locationsIdList){
        try {
            if(locationsIdList && locationsIdList.length && locationsIdList.length>0){
                const locations = []
                for(let locationId in locationsIdList){
                    const locationFromServer = await LocationModel.findById(locationId)
                    if(locationFromServer)
                        locations.push(new LocationDto(locationFromServer))
                }
                return {warning:false, data: {locations}}
            }
            return {warning: true, message:'Нет списка локаций'}
        }catch (e){
            await ErrorService.saveErrorMessage('LocationService/getLocations', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async getLocations(){
        try {
            const locationFromServer = await LocationModel.find()
            const locations = []
            locationFromServer.forEach(loc=>locations.push(new LocationDto(loc)))
            return {warning:false, data: {locations}}
        }catch (e){
            await ErrorService.saveErrorMessage('LocationService/getLocation', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async getLocation(id){
        try {
            const locationFromServer = await LocationModel.findById(id)
            if(locationFromServer)
                return {warning:false, data:{location: new LocationDto(locationFromServer)}}
            else
                return {warning: true, message:'нет локации с таким id'}
        }catch (e){
            await ErrorService.saveErrorMessage('LocationService/getLocation', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async removeLocation(id){
        try {
            const location = await LocationModel.findByIdAndDelete(id)
            if(location)
                return {warning:false, data: {location: new LocationDto(location)}}
            else
                return {warning: true, message:'нет элемента с заданным id'}
        }catch (e){
            await ErrorService.saveErrorMessage('LocationService/removeLocation', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async updateLocation(id, location){
        try {
            const locationFromServer = await LocationModel.findByIdAndUpdate(id, location)
            if(location)
                return {warning:false, data: {location: new LocationDto(locationFromServer)}}
            else
                return {warning: true, message:'нет элемента с заданным id'}
        }catch (e){
            await ErrorService.saveErrorMessage('LocationService/updateLocation', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async createLocation(location){
        try {
            if(location.id)
                delete (location.id)
            const locationFind = await LocationModel.findOne({name:location.name})
            console.log(locationFind)
            if(!locationFind){
                const t = await LocationModel.create({...location})
                console.log('crateLocation', t)
                const newLocation = await LocationModel.findOne({name:location.name})
                return {warning: false, data: {location: new LocationDto(newLocation)}}
            }else
                return {warning: true, message:'Локация с заднным именем уже существует'}
        }catch (e){
            await ErrorService.saveErrorMessage('LocationService/createLocation', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }


}

module.exports = new LocationService()