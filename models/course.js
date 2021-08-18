const mongoose = require('mongoose')

const courseSchema = mongoose.Schema({
    tutor:[{
        id:{
            type: String, 
            required:true
        }
    }],
    price:{type: Number, required: true},
    avatar:{
        type: String,
        required: false
    },
    name: {
        type: String, 
        required: true, 
        trim: true
    },
    duration:{
        type:String,
        required:true
    },
    level:{
        type:String, 
        required:false
    },
    subject:[{
        item:{
            type:String,
            required:false
    }
    }],
    overview:{
        type:String,
        required:false
    },
    syllabus:[{
        item: {
            type:String,
            required:false
        }
    }],
    rating:{
        type:Number,
        required:false
    },
    noLike:{
        type:Number,
        required:false
    }
})

courseSchema.pre('save', function (next) {
    const course = this
    course.noLike = 0
    course.rating = 4.5
    next()
})

courseSchema.statics.findByID = async (id) => {
    const course = await Course.findOne({_id : id})
    if (!course){
        throw new Error({error: "Cannot find with this id"})
    }
    return course
}

const Course = mongoose.model('course', courseSchema)

module.exports = Course