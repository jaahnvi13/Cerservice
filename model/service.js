const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const ServiceSchema= new Schema({
    sid:Number,
    stype:String,
    sdate:Date,
    vin:String,
    kmsdriven:Number,
    employee:String,
    instructions:String
})

module.exports = mongoose.model('Service',ServiceSchema);