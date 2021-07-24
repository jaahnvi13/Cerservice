const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    role:{
        type: String,
        required: true
    }
});

UserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000 && error.keyValue.email) {
        next(new Error('Email address was already taken, please choose a different one.'));
    } else {
        next(error);
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);