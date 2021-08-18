const mongoose = require('mongoose')
const Tutor = require('../models/tutor')

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

courseSchema.statics.removeSelf = async(id) =>{
    const course = await Course.findOne({_id:id})
    if (!course){
        throw new Error({error: "Cannot find with this id"})
    }
    var t_ids = course.tutor
    for (var i in t_ids){
        const t = await Tutor.findOne({_id:t_ids[i].id})
        var index = -1
        for (var j in t.course)
        {
            if (t.course[j].id == id){
                index = j
                break
            }
        }
        if (index != -1)
            t.course.splice(index,1)
        await t.save()
    }
}

const Course = mongoose.model('course', courseSchema)

module.exports = Course