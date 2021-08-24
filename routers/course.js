const express = require('express')
const Course = require('../models/course')
const Tutor = require('../models/tutor')
const router = express.Router()


router.get('/api/course/get-one', async(req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing course ID"})
    }
    var ret = await Course.findOne({_id: id})
    res.status(201).send({course : ret})
})


// router.get('/api/course/get-all', async(req, res) => {
//     var ret = await Course.find({});
//     res.status(201).send({ result: ret});
// })

router.get('/api/course/search/by-name', async(req, res) => {
    var ret = await Course.find({});
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

module.exports = router;
