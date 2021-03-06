const express = require('express')
const Course = require('../../models/course')
const Tutor = require('../../models/tutor')
const auth = require('../../middlewares/admin/auth')

const router = express.Router()

router.post('/api/admin/course/add',auth, async (req, res) => {
    // Create a new course
    try {
        const course = new Course(req.body)
        const tutors_id = req.body.tutor
        const tutors = []
        for (var id of tutors_id){
            const target = await Tutor.findOne({_id: id.id})
            if(!target)
                 return res.status(400).send({message: "Tutor not exist"})
            tutors.push(target)
        }
        await course.save()
        for (var tutor of tutors){
            tutor.addCourse(tutor._id, course._id)
            if (course.subject.length != 0){
                for (var i in course.subject)
                    tutor.addMajor(tutor._id,course.subject[i].item)
            }
        }
        res.status(201).send({  message: "Success" })
    } catch (error) {
        res.status(400).send({error})
    }
})

router.post('/api/admin/course/update', auth, async(req, res) => {
    const course_id = req.body.cid
    const new_value = req.body.value

    if (!course_id || !new_value){
        return res.status(400).send({message: "Missing information"})
    }
    Course.updateOne({_id: course_id}, new_value,function(err, ret) {
        if (err) res.status(401).send({message:"update failed"});
        else{
            console.log("1 document updated");
            res.status(201).send(ret);
        }
    });
})

router.post('/api/admin/course/delete-one', auth, async (req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing course ID"})
    }
    try {
        await Course.removeSelf(id)
        await Course.deleteOne({_id:id})
        res.status(201).send({  message: "Success" })

    } catch (error) {
        console.log(error)
        res.status(400).send({error})
    }
})

// router.get('/api/course/deleteall', async(req, res) => {
//     await Course.deleteMany({});
//     var check = await Course.find({});
//     res.status(201).send({message: "Num of docs: "+ check.length});
// })

module.exports = router;
