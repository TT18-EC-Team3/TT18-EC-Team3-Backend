const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validatePhoneNumber = require('validate-phone-number-node-js')

const config = require('../config')
const Refresh = require('./refresh')

const adminSchema = mongoose.Schema({
    name: {type: String, required: true, trim: true },
    username : { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 8, 
        validate: value => {
            var regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
            if (!regex.test(value)){
                throw new Error({error: 'Password not safe'})
            }
        }
    },
    avatar: {
        type: String,
        required: false
    }
})

adminSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const admin = this
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }
    next()
})

adminSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const admin = this
    const access = jwt.sign({_id : admin._id}, config.adminsecret, {
        expiresIn : config.adminLife,
    })
    return access
}

adminSchema.statics.findByCredentials = async (username, password) => {
    // Search for a user by email and password.
    const admin = await Admin.findOne({ username } )
    if (!admin) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, admin.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return admin
}

const Admin = mongoose.model('Admin', adminSchema)
module.exports = Admin