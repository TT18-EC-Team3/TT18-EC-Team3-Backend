const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validatePhoneNumber = require('validate-phone-number-node-js')

const config = require('../config')
const Refresh = require('./refresh')

const courseSchema = mongoose.Schema({
    tutorID:[
        {item:{type: String, required:true}}
    ],
    name: {type: String, required: true, trim: true},
    duration:{type:String,required:true},
    level:{type:String, required:false},
    subject:[
        {item:{type:String,required:false}}
    ],
    overview:{type:String,required:false},
    syllabus:{type:String,required:false},
    rating:{type:Number,required:false},
    noLike:{type:Number,required:false}
})

courseSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    // const course = this
    // if (tutor.isModified('password')) {
    //     tutor.password = await bcrypt.hash(tutor.password, 8)
    // }
    // let today = new Date().toISOString().slice(0, 10)
    // user.DayCreated = today
    // user.LastAccessed = today
    next()
})

courseSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the course
    const course = this
    const session = jwt.sign({_id: course._id}, config.refreshTokenSecret, {
        expiresIn: config.refreshLife
    })
    const refresh = new Refresh({uid: course._id, session})
    await refresh.save()
    const access = jwt.sign({_id : course._id, session}, config.secret, {
        expiresIn : config.tokenLife,
    })
    return [access, session]
}

// courseSchema.statics.findByCredentials = async (id) => {
//     // Search for a course by id.
//     const course = await Course.findOne({id})
//     if (!tutor) {
//         throw new Error({ error: 'Invalid login credentials' })
//     }
//     const isPasswordMatch = await bcrypt.compare(password, tutor.password)
//     if (!isPasswordMatch) {
//         throw new Error({ error: 'Invalid login credentials' })
//     }
//     return tutor
// }

courseSchema.statics.findByID = async (id) => {
    const course = await Course.findOne({_id : id})
    if (!course){
        throw new Error({error: "Cannot find with this id"})
    }
    return course
}

const Course = mongoose.model('course', courseSchema)

module.exports = Course