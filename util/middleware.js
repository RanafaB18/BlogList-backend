const User = require('../models/user')
const jwt = require('jsonwebtoken')

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  request.user = await User.findById(decodedToken.id)
  next()
}

const getTokenFrom = (request, response, next) => {
  request.token = null
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'ValidationError') {
    response.status(400).json({ error: 'username must be at least 3 characters long and unique' })
  }
  else if (error.name === 'PasswordValidation') {
    response.status(400).json({
      error: 'password must be at least 3 characters long'
    })
  }
  else if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

module.exports = {
  errorHandler,
  getTokenFrom,
  userExtractor
}
