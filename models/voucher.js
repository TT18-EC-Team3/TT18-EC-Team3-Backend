const mongoose = require('mongoose')

const voucherSchema = mongoose.Schema({
    code: {
        type: String, 
        required: true,
        unique: true,
    },
    from: {
        type: Date,
        required: false,
    },
    to: {
        type: Date,
        required: false,
    },
    type: {
        type: Boolean,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    }
})


const Voucher = mongoose.model('voucher', voucherSchema)

module.exports = Voucher;