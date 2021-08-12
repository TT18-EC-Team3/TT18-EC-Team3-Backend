const mongoose = require('mongoose')

const paymentSchema = mongoose.Schema({
    courseID : {
        type: String,
        required: true,
    },
    userID : {
        type: String,
        required: true,
    },
    total: {
        type: Number, 
        required: true,
    },
    status:{
        type:Number,
        required:false
    }
})


const Payment = mongoose.model('payment', paymentSchema)

module.exports = Payment