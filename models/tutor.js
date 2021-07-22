const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validatePhoneNumber = require('validate-phone-number-node-js')

const config = require('../config')
const Refresh = require('./refresh')

const tutorSchema = mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: { type: String, required: true, minLength: 8,
        validate: value => {
            var regex = /^(?=.*[0-9])(?=.*[!@#$%^&*_])[a-zA-Z0-9!@#$%^&*_]{8,16}$/
            if (!regex.test(value)){
                throw new Error({error: 'Password not safe'})
            }
        }
    },
    phone : { type : Number, required: true,
        validate: value => {
                if (!validatePhoneNumber.validate(value)){
                    throw new Error({error : 'Invalid Phone number'})
                }
        }
    }, 
    address : {type: String, required: false},
    gender : {type: Boolean, required : false},
    degree:[
        {item:{type: String, required: false}}
    ],
    DOB: [
        {item :{type: String, required: false}}],
    major:[
        {item:{type: String, required : false}}
    ],
    course:[
        {id: {type:String, required : false,unique:true}}
    ],
    accent: {type:String, required : false},
    quote:{type:String,required:false},
    education:[
        {item:{type:String,required :false}}
    ],
    exp:{type:String,required :false},
    rating:{type:Number,required:false},
    personality:{type:String,required:false},
    noLike:{type:Number,required:false},
    noOngoingCourse:{type:Number,required:false},
    avaiTime:[
        {day:[{
            start:{type:String,required:false},
            end:{type:String,required:false}
        }]}
    ]
})

tutorSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const tutor = this
    if (tutor.isModified('password')) {
        tutor.password = await bcrypt.hash(tutor.password, 8)
    }
    // let today = new Date().toISOString().slice(0, 10)
    // user.DayCreated = today
    // user.LastAccessed = today
    next()
})

tutorSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the tutor
    const tutor = this
    const session = jwt.sign({_id: tutor._id}, config.refreshTokenSecret, {
        expiresIn: config.refreshLife
    })
    const refresh = new Refresh({uid: tutor._id, session})
    await refresh.save()
    const access = jwt.sign({_id : tutor._id, session}, config.secret, {
        expiresIn : config.tokenLife,
    })
    return [access, session]
}

tutorSchema.methods.addCourse = async (tutorID, ID) => {
    try{
        const target = await Tutor.findOne({_id:tutorID})
        console.log(target)
        var courses = {course: []}
        var existCourses = target.course
        for (var i in existCourses)
            courses.course.push({id:existCourses[i].id})
        courses.course.push({id:ID})
        console.log(courses)
        await Tutor.updateOne({_id:tutorID},courses,{"upsert":true})
        const check = await Tutor.findOne({_id:tutorID})
        console.log(check)
    }
    catch(err)
    {
        console.log(err)
        return
    }
}

tutorSchema.statics.findByCredentials = async (email, password) => {
    // Search for a tutor by email and password.
    const tutor = await Tutor.findOne({ email })
    if (!tutor) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, tutor.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return tutor
}

tutorSchema.statics.findByUID = async (uid) => {
    const tutor = await Tutor.findOne({_id : uid})
    if (!tutor){
        throw new Error({error: "Cannot find with this uid"})
    }
    delete tutor.password
    return tutor
}

const Tutor = mongoose.model('tutor', tutorSchema)

module.exports = Tutor