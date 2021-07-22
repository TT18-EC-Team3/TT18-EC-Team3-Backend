const express = require('express')
const Tutor = require('../../models/tutor')
const Course = require('../../models/course')
const auth = require('../../middlewares/admin/auth')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const UPLOAD_PATH = path.resolve(__dirname, 'avatar/files')
const upload = multer({
  dest: UPLOAD_PATH,
  limits: {fileSize: 1000000, files: 1}
})

router.post('/api/admin/tutor/update-avatar', upload.single('file'), auth, (req, res) => {
    const uid = req.body.uid
    if (!uid){
      return res.status(404).send({message: "Please give tutor ID"})
    }
    const images = req.file.filename
    if (!images){
      return res.status(404).send({message: "Please give image"})
    }
    Tutor.updateOne({_id : uid},{avatar: images}, (err, result) => {
      if (err) 
        return res.status(404).send({message: "Failed"})
      res.status(201).send({message: "Success"})
    })
  })

router.post('/api/admin/course/update-avatar', upload.single('file'), auth, (req, res) => {
    const uid = req.body.uid
    if (!uid){
      return res.status(404).send({message: "Please give course ID"})
    }
    const images = eq.file.filename
    if (!images){
      return res.status(404).send({message: "Please give image"})
    }
    Course.updateOne({_id : uid},{avatar: images}, (err, result) => {
      if (err) 
        return res.status(404).send({message: "Failed"})
      res.status(201).send({message: "Success"})
    })
})


module.exports = router;