const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
  name: {
    type: String,
    required: true
  }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject.password
    delete returnedObject._id
    delete returnedObject.__v
  }
})

userSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', userSchema)
