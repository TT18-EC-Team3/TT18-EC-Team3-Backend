const express = require('express')
const Voucher = require('../../models/voucher')
const auth = require('../../middlewares/admin/auth')
const { type } = require('os')
const router = express.Router()

router.post('/api/admin/voucher/add', auth, async(req, res) => {
    try{
        console.log(req.body)
        const voucher = new Voucher(req.body)
        await voucher.save()
        res.status(202).send({message: "Add successfully"})
    } catch (error) {
        res.status(401).send({error})
    }
})

router.post('/api/admin/voucher/update', auth, async(req, res) => {
    const voucher_id = req.body.vid
    const new_value = req.body.value

    if (!voucher_id || !new_value){
        return res.status(400).send({message: "Missing information"})
    }
    Voucher.updateOne({_id: voucher_id}, new_value, function(err, ret) {
        if (err) res.status(401).send({message:"update failed"});
        else{
            console.log("1 document updated");
            res.status(201).send({message: "Success"});
        }
    });
})

router.get('/api/admin/voucher/get-all', auth, async(req, res) => {
    var ret = await Voucher.find({});
    res.status(201).send({result: ret});
})

router.post('/api/admin/voucher/delete-one', auth, async(req, res) => {
    var vid = req.body.vid
    await Voucher.deleteOne({_id: vid})
    res.status(200).send({message: "OK"});
})

module.exports = router;
