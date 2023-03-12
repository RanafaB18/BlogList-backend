const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const middleware = require('../util/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username :  1, name: 1 })
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  try {
    const blog = await Blog.findById(id)
    response.json(blog)
  }
  catch (error) {
    response.status(500).end()
  }
})


blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id){
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = request.user
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })
  try {0
    const newBlog = await blog.save()
    user.blogs = user.blogs.concat(newBlog._id)
    await user.save()
    response.status(201).json(newBlog)
  }
  catch (error) {
    response.status(400).end()
  }
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken){
    return  response.status(401).json({ error : 'invalid token' })
  }
  const id = request.params.id

  try {
    const blog = await Blog.findById(id)
    if (blog.user.toString() !== decodedToken.id){
      return response.status(401).json({ error : 'no authority to delete this  blog' })
    }
    await Blog.findByIdAndRemove(id)
    response.status(204).end()
  }
  catch (error) {
    response.status(500).end()
  }
})

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  try {

    const updatedBlog = await Blog.findByIdAndUpdate(id, request.body, { new: true })
    response.json(updatedBlog)
  }
  catch (error) {
    response.status(500).end()
  }
})

module.exports = blogRouter
