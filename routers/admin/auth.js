const express = require('express')
const Admin = require('../../models/admin')
const Refresh = require('../../models/refresh')
const auth = require('../../middlewares/admin/auth')
const jwt = require('jsonwebtoken')
const config = require('../../config')

const router = express.Router()

router.post('/api/admin/log-in', async(req, res) => {
    const {username, password} = req.body
    try {
        console.log("...")
        const admin = await Admin.findByCredentials(username, password)
        console.log('---')
        if (!admin){
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        console.log(',,,')
        const [access, session] = await admin.generateAuthToken()
        res.status(201).send({ access, session })
    } catch (error){
        res.status(400).send({error : 'Login failed! Check authentication credentials'})
    }
})

router.post('/api/admin/log-out', auth, async(req, res) => {
    try {
        await Refresh.deleteOne({session: req.session})
        res.status(201).send({"message" : "Success"})
    } catch (error){
        res.status(500).send({error})
    }
})

router.post('/api/admin/refresh-token', async(req, res) => {

    const token = req.header('Authorization').replace('Bearer ', '')
    const ref = await Refresh.findOne({session: token})
    if (!ref){
        res.status(400).send({'message' : 'Refresh token does not exist'})
        
    } else {
        const aid = ref.uid
        const admin = Admin.findOne({_id : aid})
        if (!admin){
            res.status(400).send({'message': 'Not admin'})
        } else {
            try{
                var data = jwt.verify(token, config.refreshTokenSecret)
                const access = jwt.sign({_id : data._id, session : token}, config.secret, {
                    expiresIn : config.tokenLife,
                })
                res.status(201).send({access})
            } catch (err) {
                const refresh = jwt.sign({_id: aid}, config.refreshTokenSecret, {
                    expiresIn: config.refreshLife
                })
                await Refresh.updateOne({session: token}, {session: refresh})
                const access = jwt.sign({_id : aid, session : token}, config.secret, {
                    expiresIn : config.tokenLife,
                })
                res.status(201).send({access})
            }
        }   
    }
})

module.exports = router