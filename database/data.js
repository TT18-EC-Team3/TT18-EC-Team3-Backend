const mongoose = require('mongoose')
const config = require('../config')


mongoose.connect(config.db, {
    useNewUrlParser: true,
    useCreateIndex: true,
})

let gfs;
const connect = mongoose.connection

connect.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: 'avatars'
    })
})

module.exports = gfs