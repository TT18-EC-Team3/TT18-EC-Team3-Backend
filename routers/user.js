const express = require('express')
const User = require('../models/user')
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
        const access= await user.generateAuthToken()
        res.status(201).send({ access,"id":user._id})
    } catch (error) {
        res.status(400).send({error})
    }
})

router.get('/api/customer/user-me', auth, async(req, res) => {
    // View logged in user profile
    try{
        const user = await User.findByUID(req.uid)
        res.status(201).send(user)
    } catch (error){
        res.status(400).send({error})
    }
})


router.post('/api/customer/log-out', auth, async(req, res) => {
    try {
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
        const access = await user.generateAuthToken()
        res.status(201).send({ access })
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

router.get('/api/customer/recommend/course', auth, async(req, res) => {
    const id = req.uid
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

router.get('/api/customer/recommend/tutor', auth, async(req, res) => {
    const id = req.uid
   
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
    try{
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
    } catch (error){
        res.status(401).send({error})
    }
})

router.post('/api/customer/course/like', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var cid = req.body.cid
    if (!cid){
        return res.status(400).send({message: "Missing courseID"})
    }
    try{
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
    } catch (error){
        res.status(401).send({error})
    }
})

router.post('/api/customer/course/unlike', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var cid = req.body.cid
    if (!cid){
        return res.status(400).send({message: "Missing courseID"})
    }
    try{
    var course = await Course.findOne({_id : cid})
    if (!course){
        return res.status(404).send({message: "Not found courseID"})
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
    } catch (error){
        res.status(401).send({error})
    }   
})

router.post('/api/customer/tutor/rate', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var tid = req.body.tid
    var r = req.body.rate
    if (!tid || !r){
        return res.status(400).send({message: "Missing courseID"})
    }
    try{
        var tutor = await Tutor.findOne({_id : tid})
        if (!tutor){
            return res.status(404).send({message: "Not found tutorID"})
        }
        var rate = user.rate_tutor
        var found = rate.find(element => element.tid === tid)
        var total_rate = tutor.total_rate
        if (!total_rate){
            total_rate = 0
        }
        var rating = tutor.rating
        if (!rating){
            rating = 0
        }
        var tot = rating * total_rate
        if (!found){
            rate.push({tid: tid, rate: r})
            total_rate += 1
            rating = (tot + r) / total_rate
        } else {
            var old = found.rate
            rate = rate.filter(element => element.tid !== tid)
            rate.push({tid: tid, rate: r})
            rating = (tot - old + r) / total_rate
        }
        await User.updateOne({_id: uid}, {rate_tutor: rate})
        await Tutor.updateOne({_id: tid}, {rating: rating, total_rate: total_rate})
        res.status(200).send({rating})
    } catch (error){
        res.status(401).send({error})
    }
})

router.post('/api/customer/course/rate', auth, async(req, res) => {
    var user = req.user
    var uid = req.uid
    var cid = req.body.cid
    var r = req.body.rate
    if (!cid || !r){
        return res.status(400).send({message: "Missing courseID"})
    }
    try{
        var course = await Course.findOne({_id : cid})
        if (!course){
            return res.status(404).send({message: "Not found tutorID"})
        }
        var rate = user.rate_course
        var found = rate.find(element => element.cid === cid)
        
        var total_rate = course.total_rate
        var rating = course.rating
        if (!total_rate){
            total_rate = 0
        }
        if (!rating){
            rating = 0
        }
        var tot = rating * total_rate
        if (!found){
            rate.push({cid: cid, rate: r})
            total_rate += 1
            rating = (tot + r) / total_rate
        } else {
            var old = found.rate
            rate = rate.filter(element => element.cid !== cid)
            rate.push({cid: cid, rate: r})
            rating = (tot - old + r) / total_rate
        }
        await User.updateOne({_id: uid}, {rate_course: rate})
        await Course.updateOne({_id: cid}, {rating: rating, total_rate: total_rate})
        res.status(200).send({rating})
    } catch (error){
        res.status(401).send({error})
    }
})

module.exports = router;
