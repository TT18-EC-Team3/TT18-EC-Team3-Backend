const express = require('express')
const Tutor = require('../models/tutor')
const Course = require('../models/course')
const router = express.Router()


router.get('/api/tutor/get-one', async(req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing tutor ID"})
    }
    var ret = await Tutor.findOne({_id: id})
    res.status(201).send({tutor: ret})
})


// router.get('/api/tutor/get-all', async(req, res) => {
//     var ret = await Tutor.find({});
//     res.status(201).send({result: ret});
// })

router.get('/api/tutor/search/by-name', async(req, res) => {
    var ret = await Tutor.find({});
    var qname = req.query.name.split(' ')
    var result = []
    for (var item in ret){
        var tmp = ret[item].name.toLowerCase()
        for (var ind in qname)
        {
            if (tmp.includes(qname[ind].toLowerCase())){
                result.push(ret[item])
                break
            }
        }
    }
    res.status(201).send(result);
})

router.get('/api/tutor/course/get-all', async(req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing tutor ID"})
    }
    var ret = await Tutor.findOne({_id: id})
    var courses = ret.course
    var retval = []
    for (var i in courses){
        var course = await Course.findOne({_id:courses[i].id})
        var tmp = {}
        tmp.name = course.name
        tmp.price = course.price
        retval.push(tmp)
    }
    res.status(201).send(retval)
})



// router.get('/api/tutor/delete-all', async(req, res) => {
//     await Tutor.deleteMany({});
//     var check = await Tutor.find({});
//     res.status(201).send({message: "Num of docs: "+ check.length});
// })

module.exports = router;