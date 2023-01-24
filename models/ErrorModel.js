const {Schema, model} = require('mongoose')

const ErrorModel = new Schema({
    whereError:{type:String, unique:true, required:true},
    description:{type:String},
    date:{type:Date},
})

module.exports = model('errors', ErrorModel)