const express = require('express')
const Admin = require('../../models/admin')
const auth = require('../../middlewares/admin/auth')
const jwt = require('jsonwebtoken')
const config = require('../../config')
const { ObjectID, ObjectId } = require('mongodb')

const router = express.Router()

router.post('/api/admin/log-in', async(req, res) => {
    const {username, password} = req.body
    try {
        const admin = await Admin.findByCredentials(username, password)
        if (!admin){
            return res.status(401).send({error: 'Login failed! Check authentication credentials or not found'})
        }
        const access = await admin.generateAuthToken()
        res.status(201).send({ access })
    } catch (error){
        console.log(error)
        res.status(400).send({error : 'Login failed! Check authentication credentials'})
    }
})


module.exports = router