const express = require('express')
const User = require('../models/user')
const Refresh = require('../models/refresh')
const auth = require('../middlewares/auth')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { send } = require('process')
const { isNull } = require('util')

const router = express.Router()

router.post('/api/customer/register', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const [access, session] = await user.generateAuthToken()
        res.status(201).send({ access, session })
    } catch (error) {
        res.status(400).send({error})
    }
})

router.post('/api/customer/user-me', auth, async(req, res) => {
    // View logged in user profile
    try{
        const user = await User.findByUID(req.uid)
        res.status(201).send(user)
    } catch (error){
        res.status(400).send({error})
    }
})

router.post('/api/customer/refresh-token', async(req, res) => {

    const token = req.header('Authorization').replace('Bearer ', '')
    const ref = await Refresh.findOne({session: token})
    if (!ref){
        res.status(400).send({'message' : 'Refresh token does not exist'})
        
    } else {
        const uid = ref.uid
        const user = await User.findOne({_id : uid})
        if (!user){
            res.status(400).send({'message': 'Not a user'})
        } else {
            try{
                var data = jwt.verify(token, config.refreshTokenSecret)
                const access = jwt.sign({_id : data._id, session : token}, config.secret, {
                    expiresIn : config.tokenLife,
                })
                res.status(201).send({access})
            } catch (err) {
                const refresh = jwt.sign({_id: uid}, config.refreshTokenSecret, {
                    expiresIn: config.refreshLife
                })
                await Refresh.updateOne({session: token}, {session: refresh})
                const access = jwt.sign({_id : uid, session : refresh}, config.secret, {
                    expiresIn : config.tokenLife,
                })
                res.status(201).send({access})
            }
        }   
    }
})

router.post('/api/customer/log-out', auth, async(req, res) => {
    try {
        await Refresh.deleteOne({session: req.session})
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
        const [access, session] = await user.generateAuthToken()
        res.status(201).send({ access, session })
    } catch (error){
        res.status(400).send({error : 'Login failed! Check authentication credentials'})
    }
})

module.exports = router;
