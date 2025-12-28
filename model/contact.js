const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Contact = new Schema(
    {
        nama: {
            type: String,
            required: true
        },
        nohp: {
            type: String,
        },
        email: {
            type: String,
        },
    }
)

module.exports = mongoose.model('Contact', Contact)