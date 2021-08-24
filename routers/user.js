const express = require('express')
const User = require('../models/user')
const Refresh = require('../models/refresh')
const auth = require('../middlewares/auth')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { send } = require('process')
const { isNull } = require('util')
const Tutor = require('../models/tutor')
const Course = require('../models/course')
const { route } = require('./admin/voucher')

const router = express.Router()

router.post('/api/customer/register', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const [access, session] = await user.generateAuthToken()
        res.status(201).send([{ access, session },{"id":user._id}])
    } catch (error) {
        res.status(400).send({error})
    }
})

router.post('/api/customer/user-me', auth, async(req, res) => {
    // View logged in user profile
    try{
        const user = await User.findByUID(req.uid)
        res.status(201).send(user)
    } catch (error){
        res.status(400).send({error})
    }
})

router.post('/api/customer/refresh-token', async(req, res) => {

    const token = req.header('Authorization').replace('Bearer ', '')
    const ref = await Refresh.findOne({session: token})
    if (!ref){
        return res.status(400).send({'message' : 'Refresh token does not exist'})
        
    }
    const uid = ref.uid
    const user = await User.findOne({_id : uid})
    if (!user){
        return res.status(400).send({'message': 'Not a user'})
    } 
    try{
        var data = jwt.verify(token, config.refreshTokenSecret)
        const access = jwt.sign({_id : data._id, session : token}, config.secret, {
            expiresIn : config.tokenLife,
        })
        res.status(201).send({access})
    } catch (err) {
       res.status(201).send({message: "Time out"})
    } 
})

router.post('/api/customer/log-out', auth, async(req, res) => {
    try {
        await Refresh.deleteOne({session: req.session})
        res.status(201).send({"message" : "Success"})
    } catch (error){
        res.status(500).send({error})
    }
})

router.post('/api/customer/log-in', async(req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findByCredentials(email, password)
        if (!user){
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const [access, session] = await user.generateAuthToken()
        res.status(201).send({ access, session })
    } catch (error){
        res.status(400).send({error : 'Login failed! Check authentication credentials'})
    }
})

function sortFunction(a, b) {
    if (a[0] == b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? 1 : -1;
    }
}

router.post('/api/customer/recommend/course', async(req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing user ID"})
    }
    try{
        const user = await User.findByUID(id)
        var courses = await Course.find({});
        var sort_arr = new Array(courses.length)
        for ( var i = 0;i<sort_arr.length;++i) {
            sort_arr[i] = new Array(2);
            sort_arr[i][0] = 0;
            sort_arr[i][1] = courses[i]
        }
        var mul = 1, score = 0
        for (var i = 0;i<sort_arr.length;++i){
            mul = 1
            score = 0
            var tmp = sort_arr[i][1]
            //check level
            if (user.acalevel && user.acalevel == tmp.level)
                mul += 0.25
            //check fav subjects
            for(var j  = 0;j<user.fav_subs.length;++j){
                for(var k =0;k <tmp.subject.length;++k)    
                    if (user.fav_subs[j].subject == tmp.subject[k].item)
                        mul += 0.5
            }
            if (tmp.noLike == null || tmp.rating == null)
                score = 0
            else
                score += (tmp.noLike+1)*tmp.rating*mul
            sort_arr[i][0] = score
        }

        sort_arr.sort(sortFunction);

        var ret = []
        for(var i = 0;i<sort_arr.length;++i){
            ret.push(sort_arr[i][1])
        }
        res.status(201).send(ret)

    } catch (error){
        console.log(error)
        res.status(400).send({error})
    }
})

router.post('/api/customer/recommend/tutor', async(req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing user ID"})
    }
    try{
        const user = await User.findByUID(id)
        var tutors = await Tutor.find({});
        var sort_arr = new Array(tutors.length)
        for (var i = 0;i<sort_arr.length;++i) {
            sort_arr[i] = new Array(2);
            sort_arr[i][0] = 0;
            sort_arr[i][1] = tutors[i]
        } 
        var mul = 1, score = 0
        for (var i=0;i< sort_arr.length;++i){
            mul = 1
            score = 0
            var tmp = sort_arr[i][1]
            //check user level - tutor degree
            for (var j= 0;j< tmp.degree.length;++j)
                if (user.acalevel && user.acalevel == tmp.degree[j].item)
                    mul += 0.25
            //check user fav_subs - tutor major
            for(var j=0;j< user.fav_subs.length;++j){
                for (var k=0;k< tmp.major.length;++k)
                if (user.fav_subs[j].subject == tmp.major[k].item)
                    mul += 0.5
            }
            if (tmp.noLike == null || tmp.rating == null || tmp.available.length == 0)
                score = 0
            else
                score += (tmp.noLike+1)*tmp.rating*tmp.available.length*mul
            //console.log(mul + " " + score)  
            sort_arr[i][0] = score
        }

        sort_arr.sort(sortFunction);

        var ret = new Array(sort_arr.length)
        for(var i = 0;i<sort_arr.length;++i)
            ret[i] = sort_arr[i][1]

        res.status(201).send(ret)

    } catch (error){
        console.log(error)
        res.status(400).send({error})
    }
})

router.post('/api/customer/tutor/like', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var tid = req.body.tid
    if (!tid){
        return res.status(400).send({message: "Missing tutorID"})
    }
    var tut = await Tutor.findOne({_id : tid})
    if (!tut){
        return res.status(404).send({message: "Not found tutorID"})
    }
    var liked = user.like_tutor
    var found = liked.find(element => element.tid === tid)
    if (found){
        return res.status(409).send({message: "Liked before"})
    }
    liked.push({tid})
    await User.updateOne({_id: uid}, {like_tutor: liked})
    var no = tut.noLike
    if (!no) {
        no = 0
    }
    await Tutor.updateOne({_id: tid}, {noLike: no + 1})
    res.status(200).send({message: "OK"})
})

router.post('/api/customer/tutor/unlike', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var tid = req.body.tid
    if (!tid){
        return res.status(400).send({message: "Missing tutorID"})
    }
    var tut = await Tutor.findOne({_id : tid})
    if (!tut){
        return res.status(404).send({message: "Not found tutorID"})
    }
    var liked = user.like_tutor
    var found = liked.find(element => element.tid === tid)
    if (!found){
        return res.status(409).send({message: "Did not like before"})
    }
    var new_like = liked.filter(element => element.tid !== tid)
    await User.updateOne({_id: uid}, {like_tutor: new_like})
    var no = tut.noLike
    await Tutor.updateOne({_id: tid}, {noLike: no - 1})
    res.status(200).send({message: "OK"})
})

router.post('/api/customer/course/like', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var cid = req.body.cid
    if (!cid){
        return res.status(400).send({message: "Missing courseID"})
    }
    var course = await Course.findOne({_id : cid})
    if (!course){
        return res.status(404).send({message: "Not found courseID"})
    }
    var liked = user.like_course
    var found = liked.find(element => element.cid === cid)
    if (found){
        return res.status(409).send({message: "Liked before"})
    }
    liked.push({cid})
    await User.updateOne({_id: uid}, {like_course: liked})
    var no = course.noLike
    if (!no){
        no = 0
    }
    await Course.updateOne({_id: cid}, {noLike: no + 1})
    res.status(200).send({message: "OK"})
})

router.post('/api/customer/course/unlike', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var cid = req.body.cid
    if (!cid){
        return res.status(400).send({message: "Missing courseID"})
    }
    var course = await Course.findOne({_id : cid})
    if (!course){
        return res.status(404).send({message: "Not found tutorID"})
    }
    var liked = user.like_course
    var found = liked.find(element => element.cid === cid)
    if (!found){
        return res.status(409).send({message: "Did not like before"})
    }
    var new_like = liked.filter(element => element.cid !== cid)
    await User.updateOne({_id: uid}, {like_course: new_like})
    var no = course.noLike
    await Course.updateOne({_id: cid}, {noLike: no - 1})
    res.status(200).send({message: "OK"})
})

module.exports = router;
