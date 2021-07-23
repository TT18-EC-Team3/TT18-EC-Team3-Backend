const express = require('express')
const Course = require('../models/course')

const router = express.Router()


router.get('/api/course/get-one', async(req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing course ID"})
    }
    var ret = await Course.findOne({_id: id})
    res.status(201).send({course : ret})
})


router.get('/api/course/get-all', async(req, res) => {
    var ret = await Course.find({});
    res.status(201).send({ result: ret});
})

module.exports = router;
