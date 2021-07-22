const express = require('express')
const User = require('../models/user')
const Tutor = require('../models/tutor')
const Course = require('../models/course')
const auth = require('../middlewares/auth')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const UPLOAD_PATH = path.resolve(__dirname, 'avatar/files')
const upload = multer({
  dest: UPLOAD_PATH,
  limits: {fileSize: 1000000, files: 1}
})

router.post('/api/customer/update-avatar', upload.single('file'), auth, (req, res) => {
  const uid = req.uid
  const images = req.file.filename
  User.updateOne({_id : uid}, {avatar: images}, (err, result) => {
    if (err)  
      return res.status(404).send({message: "Failed"})
    res.status(201).send({message: "Success"})
  })
})

router.get('/api/customer/get-avatar', auth, async(req, res) => {
    const uid = req.uid
    const user = await User.findOne({_id: uid});
    if (!user) {
      res.status(404).send({message: "Not Found"})
    }
    else{
      fs.createReadStream(path.resolve(UPLOAD_PATH, user.avatar)).pipe(res)
    }
      
  })

router.get('/api/tutor/get-avatar', async(req, res) => {
  const uid = req.headers.uid || req.query.uid
  if (!uid){
    return res.status(404).send({message: "Please give tutor ID"})
  }
  const tutor = await Tutor.findOne({_id: uid});
    if (!tutor) {
      res.status(404).send({message: "Not Found"})
    }
    else{
      fs.createReadStream(path.resolve(UPLOAD_PATH, tutor.avatar)).pipe(res)
    }
})

router.get('/api/course/get-avatar', async(req, res) => {
  const uid = req.headers.uid || req.query.uid
  if (!uid){
    return res.status(404).send({message: "Please give course ID"})
  }
  const course = await Course.findOne({_id: uid});
    if (!course) {
      res.status(404).send({message: "Not Found"})
    }
    else{
      fs.createReadStream(path.resolve(UPLOAD_PATH, course.avatar)).pipe(res)
    }
})

module.exports = router;
