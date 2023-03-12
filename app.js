const express = require('express')
const app = express()
require('express-async-errors')
const userRouter = require('./controllers/users')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./util/config')
const { info, error } = require('./util/logger')
const blogRouter = require('./controllers/blogs')
const { errorHandler, getTokenFrom } = require('./util/middleware')
const loginRouter = require('./controllers/login')

const mongoUrl = config.MONGODB_URI
mongoose.set('strictQuery', false)
mongoose.connect(mongoUrl)
  .then(() => {
    info('Connected to MongoDB')
  })
  .catch(() => {
    error('Error connecting to MongoDB')
    process.exit(0)
  })

app.use(cors())
app.use(express.json())
app.use(getTokenFrom)
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use(errorHandler)
module.exports = app
