const mongoose = require('mongoose')

// User Schema with validation
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // ensures no duplicate usernames
        trim: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema)