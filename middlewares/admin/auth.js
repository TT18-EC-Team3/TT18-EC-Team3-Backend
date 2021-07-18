const jwt = require('jsonwebtoken')
const Admin = require('../../models/admin')
const config = require('../../config')
const Refresh = require('../../models/refresh')


const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, config.secret)
        const aid = jwt.verify(data.session, config.refreshTokenSecret)
        if (aid._id !== data._id){
            throw new Error({error: "AdminID does not match"})
        }
        const session = await Refresh.findOne({ session: data.session })
        if (!session) {
            throw new Error({error: "Refresh token does not exist"})
        }
        const admin = await Admin.findOne({_id : aid._id})
        if (!admin){
            throw new Error({error: "Not admin"})
        }
        req.aid = aid._id
        req.session = data.session
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}


module.exports = auth
