const express = require('express')
const Payment = require('../../models/payment')
const auth = require('../../middlewares/admin/auth')

const router = express.Router()


router.post('/api/admin/payment/accept', auth, async(req, res) => {
    const course_id = req.body.cid
    const user_id = req.body.uid

    if (!course_id || !user_id){
        return res.status(400).send({message: "Missing information"})
    }
    Tutor.updateOne({courseID: course_id, userID: user_id}, {status: 1}, function(err, ret) {
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
    Tutor.updateOne({courseID: course_id, userID: user_id}, {status: 2}, function(err, ret) {
        if (err) res.status(401).send({message:"update failed"});
        else{
            console.log("1 document updated");
            res.status(201).send({message: "Success"});
        }
    });
})

router.get('/api/payment/admin/get-all', auth, async(req, res) => {
    var ret = await Payment.find({})
    res.status(201).send({Result: ret})
})

module.exports = router;