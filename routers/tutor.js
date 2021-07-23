const express = require('express')
const Tutor = require('../models/tutor')

const router = express.Router()


router.get('/api/tutor/get-one', async(req, res) => {
    const id = req.query.uid || req.headers.uid
    if (!id){
        return res.status(400).send({message: "Missing tutor ID"})
    }
    var ret = await Tutor.findOne({_id: id})
    res.status(201).send({tutor: ret})
})


router.get('/api/tutor/get-all', async(req, res) => {
    var ret = await Tutor.find({});
    res.status(201).send({result: ret});
})

// router.get('/api/tutor/delete-all', async(req, res) => {
//     await Tutor.deleteMany({});
//     var check = await Tutor.find({});
//     res.status(201).send({message: "Num of docs: "+ check.length});
// })

module.exports = router;