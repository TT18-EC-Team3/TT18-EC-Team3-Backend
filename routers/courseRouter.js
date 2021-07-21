const express = require('express')
const Course = require('../models/course')
const Tutor = require('../models/tutor')
const Refresh = require('../models/refresh')
const auth = require('../middlewares/auth')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { send } = require('process')
const { isNull } = require('util')

const router = express.Router()

router.post('/api/admin/course/register', async (req, res) => {
    // Create a new course
    try {
        console.log('Course create')
        const course = new Course(req.body)
        const tutors = req.body.tutorID
        for (var i in tutors){
            const target = await Tutor.findOne({_id:tutors[i].item})
            if(!target)
                res.status(400).send({message: "Tutor not exist"})
            target.addCourse(tutors[i].item,course._id)
            console.log("Tutor exist and added")
        }
        console.log('created')
        await course.save()
        console.log('saved')
        const [access, session] = await course.generateAuthToken()
        console.log('token')
        res.status(201).send({ access, session, id: course._id })
    } catch (error) {
        res.status(400).send({error})
    }
})

router.post('/api/admin/course/refresh-token', async(req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '')
    const ref = await Refresh.findOne({session: token})
    if (!ref){
        res.status(400).send({'message' : 'Refresh token does not exist'})
        
    } else {
        const uid = ref.uid
        const user = User.findOne({_id : uid})
        if (!user){
            res.status(400).send({'message': 'Course not exist'})
        } else {
            try{
                var data = jwt.verify(token, config.refreshTokenSecret)
                const access = jwt.sign({_id : data._id, session : token}, config.secret, {
                    expiresIn : config.tokenLife,
                })
                res.status(201).send({access})
            } catch (err) {
                const refresh = jwt.sign({_id: uid}, config.refreshTokenSecret, {
                    expiresIn: config.refreshLife
                })
                await Refresh.updateOne({session: token}, {session: refresh})
                const access = jwt.sign({_id : uid, session : token}, config.secret, {
                    expiresIn : config.tokenLife,
                })
                res.status(201).send({access})
            }
        }   
    }
})

router.post('/api/admin/course/update', async(req, res) => {
    Course.updateOne({_id:req.body.uid},req.body.value,function(err, ret) {
        if (err) res.status(401).send({message:"update failed"});
        else{
            console.log("1 document updated");
            res.status(201).send(ret);
        }
    });
})

router.get('/api/admin/course/by-id', async(req, res) => {
    var ret = await Course.findOne({_id:req.headers.uid})
    res.status(201).send({ret})
})


router.get('/api/admin/course/getall', async(req, res) => {
    var ret = await Course.find({});
    res.status(201).send(ret);
})

router.get('/api/admin/course/deleteall', async(req, res) => {
    await Course.deleteMany({});
    var check = await Course.find({});
    res.status(201).send({message: "Num of docs: "+ check.length});
})

module.exports = router;
