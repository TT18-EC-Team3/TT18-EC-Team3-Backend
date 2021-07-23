const jwt = require('jsonwebtoken')
const Admin = require('../../models/admin')
const config = require('../../config')
const Refresh = require('../../models/refresh')


const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, config.adminsecret)
        const admin = await Admin.findOne({_id : data._id})
        if (!admin){
            throw new Error({error: "Not admin"})
        }
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}


module.exports = auth
