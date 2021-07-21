const express = require('express')
const Image = require('../models/image')
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

router.post('/api/customer/upload-avatar', upload.array('file', 1), auth, (req, res) => {
    const uid = req.uid
    const images = req.files.map((file) => {
      return {
        filename: file.filename,
        originalname: file.originalname,
        uid : uid,
        type: 1
      }
    })
    Image.insertMany(images, (err, result) => {
      if (err) return res.sendStatus(404)
      res.status(201).send({message: "Success"})
    })
  })

router.post('/api/customer/update-avatar', upload.single('file'), auth, (req, res) => {
  const uid = req.uid
  const images = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      uid : uid,
      type: 1
    }
  Image.updateOne({uid, type : 1},images, (err, result) => {
    if (err) return res.sendStatus(404)
    res.status(201).send({message: "Success"})
  })
})

router.get('/api/customer/get-avatar', auth, async(req, res) => {
    console.log('get avatar')
    const uid = req.uid
    console.log(uid)
    const image = await Image.findOne({uid: uid, type: 1});
    console.log(image)
    if (!image) {
      res.status(404).send({message: "Not Found"})
    }
    else{
      fs.createReadStream(path.resolve(UPLOAD_PATH, image.filename)).pipe(res)
    }
      
  })

router.get('/api/tutor/get-avatar', async(req, res) => {
  const uid = req.headers.uid
  const image = await Image.findOne({uid: uid, type: 2});
    if (!image) {
      res.status(404).send({message: "Not Found"})
    }
    else{
      fs.createReadStream(path.resolve(UPLOAD_PATH, image.filename)).pipe(res)
    }
})

router.get('/api/course/get-avatar', async(req, res) => {
  const uid = req.uid
  const image = await Image.findOne({uid: uid, type: 3});
    if (!image) {
      res.status(404).send({message: "Not Found"})
    }
    else{
      fs.createReadStream(path.resolve(UPLOAD_PATH, image.filename)).pipe(res)
    }
})

module.exports = router;
