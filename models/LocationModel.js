const {Schema, model} = require('mongoose')

const LocationModel = new Schema({
    name:{type:String, unique:true, required:true},
    description:{type:String},
    type:{type:String},
    user:{type:String},
    isActive:{type:Boolean, default:true},
})

module.exports = model('locations', LocationModel)