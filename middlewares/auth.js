const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../config')
const Refresh = require('../models/refresh')


const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, config.secret)
        const uid = jwt.verify(data.session, config.refreshTokenSecret)
        if (uid._id !== data._id){
            throw new Error({error: "UserID does not match"})
        }
        const session = await Refresh.findOne({ session: data.session })
        if (!session) {
            throw new Error({error: "Refresh token does not exist"})
        }
        const user = await User.findOne({_id : uid._id})
        if (!user){
            throw new Error({error: "Not a user"})
        }
        req.uid = uid
        req.session = data.session
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}


module.exports = auth
