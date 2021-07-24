const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const CarownerSchema= new Schema({
    model: String,
    year: Number,
    vin:String,
    kmsdriven:Number,
    dop:Date,
    owner: String,
    contact: Number,
    email: String,
    address: String,
    createdOn:Date,
    services: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Service'
        }
    
})

module.exports = mongoose.model('Carowner',CarownerSchema);
