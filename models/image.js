const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Image = new Schema({
  filename: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true
  }
}, {timestamps: true})

Image.index({ uid: 1, type: 1 }, { unique: true });
module.exports = mongoose.model('Image', Image)