const express = require('express')
const userRouter = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')


userRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate('blogs', { url: 1, title: 1, author: 1 })
  response.json(users)
})

userRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const blog = await User.findById(id)
  response.json(blog)
})

userRouter.post('/', async (request, response, next) => {
  const { username, password, name } = request.body
  if (password.length < 3) {
    next({
      name: 'PasswordValidation',
    })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const newUser = User({
    username: username,
    password: passwordHash,
    name: name
  })
  const savedUser = await newUser.save()
  response.status(201).json(savedUser)
})

userRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  const deletedBlog = await User.findByIdAndRemove(id)
  response.json(deletedBlog).end()
})

userRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const updatedNote = await User.findByIdAndUpdate(id, response.body)
  response.json(updatedNote)
})

userRouter.delete('/', async (request, response) => {
  await User.deleteMany({})
  response.end()
})

module.exports = userRouter
