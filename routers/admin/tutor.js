const express = require('express')
const Tutor = require('../../models/tutor')
const auth = require('../../middlewares/admin/auth')

const router = express.Router()

router.post('/api/admin/tutor/add', auth,  async (req, res) => {
    // Create a new user
    try {
        const user = new Tutor(req.body)
        await user.save()
        res.status(201).send({ message: "Success" })
    } catch (error) {
        res.status(400).send({error})
    }
})


router.post('/api/admin/tutor/update', auth, async(req, res) => {
    const tutor_id = req.body.uid
    const new_value = req.body.value

    if (!tutor_id || !new_value){
        return res.status(400).send({message: "Missing information"})
    }
    Tutor.updateOne({_id: tutor_id}, new_value,function(err, ret) {
        if (err) res.status(401).send({message:"update failed"});
        else{
            console.log("1 document updated");
            res.status(201).send({message: "Success"});
        }
    });
})

router.post('/api/admin/tutor/delete-one', auth, async (req, res) => {
    const id = req.query.uid
    if (!id){
        return res.status(400).send({message: "Missing tutor ID"})
    }
    try {
        var tutor = await Tutor.findOne({_id: id})
        for (var i in tutor.course){
            await Course.removeSelf(tutor.course[i].id)
            await Course.deleteOne({_id: tutor.course[i].id})
        }
        await Tutor.deleteOne({_id:id})
        res.status(201).send({ message: "Success" })
    } catch (error) {
        res.status(400).send({error})
    }
})

module.exports = router;
