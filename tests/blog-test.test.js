const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('../util/blog_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
let token = null

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
  const blogObjects = helper.blogPosts.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blogs) => blogs.save())
  await Promise.all(promiseArray)

  const user = {
    username: 'Ranafa',
    password: 'root',
    name: 'abdul-raziq'
  }
  await api
    .post('/api/users')
    .send(user)



  const login = await api
    .post('/api/login')
    .send({ username: user.username, password: user.password })
  token = login.body.token
}, 100000)

test('get data', async () => {
  const response = await api.get('/api/blogs')
  expect(response.statusCode).toEqual(200)
  expect(response.body.length).toEqual(3)
})

test('post has an id property', async () => {
  const response = await api.get('/api/blogs')
  expect(response.statusCode).toEqual(200)
  const blogs = response.body
  expect(blogs[0].id).toBeDefined()
})

test('posting a blog post works', async () => {
  const newBlog = {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    url: 'https://prideandprejudice.com',
    likes: 342984
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const response = await api.get('/api/blogs')
  expect(response.body.length).toEqual(helper.blogPosts.length + 1)

  const contents = response.body.map((content) => content.title)
  expect(contents).toContain('Pride and Prejudice')
})

test('likes property is 0 if it wasn\'t present in request', async () => {
  const newNote = {
    title: 'Twilight Saga',
    author: 'Stephanie Meyer',
    url: 'https://saga.com',
  }
  const res = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newNote)
  expect(res.statusCode).toEqual(201)
  expect(res.body).toHaveProperty('likes')
  expect(res.body.likes).toEqual(0)
})

test('send bad request if title and url are missing', async () => {
  const newNote = {
    author: 'Stephanie Meyer',
  }
  const res = await api.post('/api/blogs').send(newNote)
  expect(res.statusCode).toEqual(400)
})

describe('Deleting a blog post', () => {
  test('with a valid id', async () => {
    let getBlogs = await api.get('/api/blogs')
    let blogs = getBlogs.body
    const validID = blogs[0].id
    const response = await api
      .delete(`/api/blogs/${validID}`)
      .set('Authorization', `Bearer ${token}`)

    getBlogs = await api.get('/api/blogs')
    blogs = getBlogs.body
    expect(response.statusCode).toEqual(204)
    expect(
      blogs.length).toEqual(helper.blogPosts.length - 1)
  }, 10000)

  test('with invalid id', async () => {
    let getBlogs = await api.get('/api/blogs')
    let blogs = getBlogs.body
    const response = await api
      .delete('/api/blogs/1')
      .set('Authorization', `Bearer ${token}`)

    getBlogs = await api.get('/api/blogs')
    blogs = getBlogs.body
    expect(response.statusCode).toEqual(500)
    expect(blogs.length).toEqual(helper.blogPosts.length)
  })
})

describe('Updating', () => {
  test('blog with valid id', async () => {
    const blogs = await api.get('/api/blogs')
    const validID = blogs.body[2].id
    const updatedAuthor = {
      author: 'Masashi Kishimoto'
    }
    await api
      .put(`/api/blogs/${validID}`).send(updatedAuthor)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    const newBlog = await api.get('/api/blogs')

    newBlog.body.forEach((blog) => {
      if (blog.id === validID) {
        expect(blog.author).toBe('Masashi Kishimoto')
      }
    })
    expect(blogs.body.length).toEqual(helper.blogPosts.length)
  })
  test('blog with invalid id', async () => {
    const updatedAuthor = {
      name: 'Masashi Kishimoto'
    }
    const response = await api.put('/api/blogs/1', updatedAuthor)
    expect(response.statusCode).toEqual(500)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', password: passwordHash, name: 'Superuser' })

    await user.save()
  })

  test('new user was added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Rage',
      password: 'rage4ever',
      name: 'Cain'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('with a non-unique username', async () => {
    const newUser = {
      username: 'root',
      password: 'something',
      name: 'tree'
    }
    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('username must be at least 3 characters long and unique')
      })
    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body.length).toEqual(usersAtStart.length)
  })

  test('with a short password', async () => {
    const newUser = {
      username: 'ranafa',
      password: 'so',
      name: 'tree'
    }
    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('password must be at least 3 characters long')
      })
    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body.length).toEqual(usersAtStart.length)
  })
})
afterAll(() => {
  mongoose.connection.close()
})
