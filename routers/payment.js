const express = require('express')
const Payment = require('../models/payment')
const auth = require('../middlewares/auth')

const router = express.Router()


router.post('/api/payment/success', auth, async(req, res) => {
    const id = req.uid
    const c_id = req.body.cid 
    const total = req.body.total 
    if (!c_id){
        return res.status(400).send({message: "Missing course ID"})
    }
    if (!total){
        return res.status(400).send({message: "Missing total cash"})
    }
    const payment = new Payment({
        courseID: c_id,
        userID: id,
        total: total,
        status: 0
    })
    await payment.save()
    res.status(201).send({  message: "Success" })
})

router.post('/api/payment/fail', auth, async(req, res) => {
    const id = req.uid
    const c_id = req.query.uid || req.headers.uid
    const total = req.query.total || req.headers.total
    if (!c_id){
        return res.status(400).send({message: "Missing course ID"})
    }
    if (!total){
        return res.status(400).send({message: "Missing total cash"})
    }
    const payment = new Payment({
        courseID: c_id,
        userID: id,
        total: total,
        status: -1
    })
    await payment.save()
    res.status(201).send({  message: "Success" })
})

router.get('/api/payment/get-me', auth, async(req, res) => {
    const uid = req.uid
    var ret = await Payment.find({userID: uid})
    res.status(201).send({Result: ret})
})

module.exports = router;
