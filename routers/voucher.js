const express = require('express')
const Voucher = require('../models/voucher')
const auth = require('../middlewares/auth')
const router = express.Router()

router.post('/api/customer/voucher/apply', async(req, res) => {
    var code = req.body.code
    if (!code){
        return res.status(400).send({message : "Missing code"})
    }
    var ret = await Voucher.findOne({code})
    if (!ret){
        return res.status(404).send({message: "Not found"})
    }
    var current = Date.now()
    var now = new Date(current)
    var from = ret.from
    var to = ret.to
    if ((from && (from.getTime() > now.getTime())) || (to && (now.getTime() > to.getTime()))){
        return res.status(406).send({message: "Time out"})
    }
    console.log(ret)
    res.status(202).send({message: ret})
})

module.exports = router;
