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
            required : false,
        }
    }],
    course:[{
        id: {
            type:String, 
            required : false,
            //unique:true
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
    if (!tutor.noLike)
        tutor.noLike = 0
    if(!tutor.noOngoingCourse)
        tutor.noOngoingCourse = 0
    if(tutor.degree.length == 0)
        tutor.degree.push({"item":"general"})
    if(!tutor.rating)
        tutor.rating = 3
    next()
})


tutorSchema.methods.addCourse = async (tutorID, ID) => {
    try{
        const target = await Tutor.findOne({_id:tutorID})
        //console.log(target)
        target.course.push({id : ID})
        await target.save()
    }
    catch(err)
    {
        console.log(err)
        return
    }
}

tutorSchema.methods.addMajor = async (tutorID, major) => {
    try{
        const target = await Tutor.findOne({_id:tutorID})
        console.log("add major for tutor "+major)
        var addVal = {}
        addVal.item = major
        console.log(addVal)
        var exist = false
        for (i in target.major)
            if (target.major[i].item == major){
                console.log("major existed -> ignore")
                exist = true
                break
            }
        if(!exist)
            target.major.push(addVal)
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