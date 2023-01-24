const GameModel = require('../../models/GameModel')
const GameDto = require('../../dtos/GameDto')
const ErrorService = require("../ErrorService");

class GameService{

    async getGames(){
        try {
            const gamesList = await GameModel.find()
            const games = []
            gamesList.forEach(game=>games.push(new GameDto(game)))
            return {warning:false, data: {games}}
        }catch (e){
            await ErrorService.saveErrorMessage('GameService/getGames', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async getGame(id){
        try {
            const gameFromServer = await GameModel.findById(id)
            if(gameFromServer)
                return {warning:false, data: {game:new GameDto(gameFromServer)}}
            else
                return {warning:true, message: 'Нет игры по заданному Id'}
        }catch (e){
            await ErrorService.saveErrorMessage('GameService/getGame', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async removeGame(id){
        try {
            const gameFromServer = await GameModel.findByIdAndDelete(id)
            if(gameFromServer)
                return {warning:false, data: {game: new GameDto(gameFromServer)}}
            else
                return {warning:true, message:'Нет игры по заданному id'}
        }catch (e){
            await ErrorService.saveErrorMessage('GameService/removeGame', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async updateGame(id, game){
        try {
            const gameFind = await GameModel.findById(id)
            if(gameFind){
                const updatesGame = await GameModel.findByIdAndUpdate(id, game)
                return {warning:false, data: {game: updatesGame}}
            }else
                return {warning: true, message:'нет элемента по заданному id'}

        }catch (e){
            await ErrorService.saveErrorMessage('GameService/updateGames', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

    async createGame(game){
        try {
            if(game.id)
                delete (game.id)
            const gameFind = await GameModel.findOne({name:game.name})
            if(gameFind){
                return {warning: true, message:'Игра с зааднным именем уже существует'}
            }else{
                await GameModel.create({...game})
                const newGame = await GameModel.findOne({name:game.name})
                return {warning: false, data: {game: new GameDto(newGame)}}
            }

        }catch (e){
            await ErrorService.saveErrorMessage('GameService/createGame', e.message)
            return {warning: true, message:'Ошибка сервера'}
        }
    }

}

module.exports = new GameService()