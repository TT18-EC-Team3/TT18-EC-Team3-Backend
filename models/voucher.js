const mongoose = require('mongoose')

const voucherSchema = mongoose.Schema({
    code: {
        type: String, 
        required: true,
        unique: true,
    },
    from: {
        // date: {
        //     type: Number,
        //     required: true,
        // },
        // month: {
        //     type: Number,
        //     required: true,
        // },
        // year: {
        //     type: Number,
        //     required: true,
        // },
        // hour: {
        //     type: Number,
        //     required: true,
        // },
        // minute: {
        //     type: Number,
        //     required: true,
        // },
        // second: {
        //     type: Number,
        //     required: true,
        // },
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