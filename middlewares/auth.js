const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../config')


const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, config.secret)
        
        const user = await User.findOne({_id : data._id})
        if (!user){
            throw new Error({error: "Not a user"})
        }
        req.uid = data._id
        req.user = user
        req.session = data.session
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}


module.exports = auth
