const express = require('express')
const Payment = require('../../models/payment')
const Course = require('../../models/course')
const User = require('../../models/user')
const Tutor = require('../../models/tutor')
const auth = require('../../middlewares/admin/auth')

const router = express.Router()


router.post('/api/admin/payment/accept', auth, async(req, res) => {
    const course_id = req.body.cid
    const user_id = req.body.uid

    if (!course_id || !user_id){
        return res.status(400).send({message: "Missing information"})
    }
    Payment.updateOne({courseID: course_id, userID: user_id}, {status: 1}, function(err, ret) {
        if (err) res.status(401).send({message:"update failed"});
        else{
            console.log("1 document updated");
            res.status(201).send({message: "Success"});
        }
    });
})

router.post('/api/admin/payment/reject', auth, async(req, res) => {
    const course_id = req.body.cid
    const user_id = req.body.uid

    if (!course_id || !user_id){
        return res.status(400).send({message: "Missing information"})
    }
    Payment.updateOne({courseID: course_id, userID: user_id}, {status: 2}, function(err, ret) {
        if (err) res.status(401).send({message:"update failed"});
        else{
            console.log("1 document updated");
            res.status(201).send({message: "Success"});
        }
    });
})

router.get('/api/payment/admin/get-all', auth, async(req, res) => {
    var status = req.query.status || req.headers.status
    var ret
    if (!status){
        ret = await Payment.find({})
    } else {
        ret = await Payment.find({status: status})
    }
    var retval = []
    for (i in ret){
        let now = JSON.parse(JSON.stringify(ret[i]))
        let cid = now.courseID
        let uid = now.userID
        let course = await Course.findOne({_id: cid})
        let user = await User.findOne({_id: uid})
        now['course'] = course
        now['user'] = user
        let tutor = course.tutor
        let tut = []
        for (j in tutor){
            let tid = tutor[j]
            let t = await Tutor.findOne({_id: tid.id})
            tut.push(t)
        }
        now.tutor = tut
        retval.push(now)
    }
    res.status(201).send({result: retval})
})

module.exports = router;