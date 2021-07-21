const express = require('express')
const Image = require('../../models/image')
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

router.post('/api/admin/tutor/upload-avatar', upload.array('file', 1), auth, (req, res) => {
    const uid = req.body.uid
    const images = req.files.map((file) => {
      return {
        filename: file.filename,
        originalname: file.originalname,
        uid : uid,
        type: 2
      }
    })
    Image.insertMany(images, (err, result) => {
      if (err) return res.sendStatus(404)
      res.status(201).send({message: "Success"})
    })
  })

router.post('/api/admin/course/upload-avatar', upload.array('file', 1), auth, (req, res) => {
    const uid = req.body.uid
    const images = req.files.map((file) => {
        return {
        filename: file.filename,
        originalname: file.originalname,
        uid : uid,
        type: 3
        }
    })
    Image.insertMany(images, (err, result) => {
        if (err) return res.sendStatus(404)
        res.status(201).send({message: "Success"})
    })
})

router.post('/api/admin/tutor/update-avatar', upload.array('file', 1), auth, (req, res) => {
    const uid = req.body.uid
    const images = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        uid : uid,
        type: 2
      }
    Image.updateOne({uid, type : 2},images, (err, result) => {
      if (err) return res.sendStatus(404)
      res.status(201).send({message: "Success"})
    })
  })

router.post('/api/admin/course/update-avatar', upload.array('file', 1), auth, (req, res) => {
    const uid = req.body.uid
    const images = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        uid : uid,
        type: 3
      }
    Image.updateOne({uid, type : 3},images, (err, result) => {
      if (err) return res.sendStatus(404)
      res.status(201).send({message: "Success"})
    })
})


module.exports = router;