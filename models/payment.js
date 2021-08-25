const mongoose = require('mongoose')
const validator = require('validator')

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
    },
    email: {
        type: String,
        required: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    }
})


const Payment = mongoose.model('payment', paymentSchema)

module.exports = Payment