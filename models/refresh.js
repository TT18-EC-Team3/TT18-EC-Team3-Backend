const mongoose = require('mongoose')

const refreshSchema = mongoose.Schema({
    uid : {
        type: String,
        required: true
    },
    session: {
        type: String,
        required: true,
        unique: true
    }
})

refreshSchema.statics.findByToken = async (token) => {
    const session = await Refresh.findOne({session: token})
    if (!session){
        throw new Error({error : "Refresh token does not exist"})
    }
    return session
}

const Refresh = mongoose.model('Refresh', refreshSchema)
module.exports = Refresh