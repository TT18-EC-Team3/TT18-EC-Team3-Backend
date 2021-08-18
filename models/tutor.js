const mongoose = require('mongoose')
const validator = require('validator')
const validatePhoneNumber = require('validate-phone-number-node-js')

const tutorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true, 
        trim: true
    },
    email: {
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    phone : { 
        type : Number, 
        required: true,
        validate: value => {
                if (!validatePhoneNumber.validate(value)){
                    throw new Error({error : 'Invalid Phone number'})
                }
        }
    }, 
    avatar:{
        type: String,
        required: false
    },
    address : {
        type: String, 
        required: false
    },
    gender : {
        type: Number, 
        required : false
    },
    degree:[{
        item:{
            type: String, 
            required: false
        }
    }],
    DOB: {
        day : {
            type: Number, required: true
        },
        month: {
            type: Number, required: true
        },
        year: {
            type: Number, required: true
        }
    },
    major:[{
        item:{
            type: String, 
            required : false
        }
    }],
    course:[{
        id: {
            type:String, 
            required : false,
            unique: false
        }
    }],
    accent: {
        type:String, 
        required : false
    },
    quote:{
        type:String,
        required:false
    },
    education:[{
        item:{
            type:String,
            required :false
        }
    }],
    exp:{
        type:String,
        required :false
    },
    rating:{
        type:Number,
        required:false
    },
    personality:{
        type:String,
        required:false
    },
    noLike:{
        type:Number,
        required:false
    },
    noOngoingCourse:{
        type:Number,
        required:false
    },
    available:[{
        time:{
            start:{
                type:String,
                required:true
            },
            end:{
                type:String,
                required:true
            }
        }, 
        day: {
            type: String, 
            required: true
        }
    }]
})

tutorSchema.pre('save', function (next) {

    const tutor = this
    tutor.noLike = 0
    tutor.noOngoingCourse = 0
    next()
})


tutorSchema.methods.addCourse = async (tutorID, ID) => {
    try{
        const target = await Tutor.findOne({_id:tutorID})
        console.log(target)
        target.course = target.course.concat({id : ID})
        await target.save()
    }
    catch(err)
    {
        console.log(err)
        return
    }
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