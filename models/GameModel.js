const {Schema, model} = require('mongoose')

const GameModel = new Schema({
    name:{type:String, unique:true, required:true},
    description:{type:String},
    countTeams:{type:Number},
    countRound:{type:Number},
    map:{type:Map},
    locations:{type:[String]},
    isActive:{type:String, default:true},

})

module.exports = model('games', GameModel)