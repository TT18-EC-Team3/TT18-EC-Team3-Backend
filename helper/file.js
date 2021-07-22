
const crypto = require('crypto')
const {GridFsStorage} = require('multer-gridfs-storage')
const path = require('path')
const multer = require('multer')
const config = require('../config')

const storage = new GridFsStorage({
    url: config.db,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err)
            return reject(err)
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
        };
          resolve(fileInfo);
        })
      })
    }
  })
  
  
  const upload = multer({ storage })
  module.exports = upload