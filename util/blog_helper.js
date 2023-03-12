const Blog = require('../models/blog')
const User = require('../models/user')

const blogPosts = [
  {
    title: 'Fantastic Beasts and Where To Find Them',
    author: 'J.K Rowling',
    url: 'www.pottermore.com',
    likes: 10000,
  },
  {
    title: 'How to become a Full Stack Developer',
    author: 'FullStackOpen',
    url: 'https://fullstackopen.com',
    likes: 50000,
  },
  {
    title: 'Naruto',
    author: 'Hiro Mashima',
    url: 'https://naruto.com',
    likes: 9394392,
  }
]

const allBlogs = async () => {
  const blogs = await Blog.find({})
  return blogs
}

const usersInDb = async () => {
  const users = User.find({})
  return users
}
module.exports = {
  blogPosts,
  allBlogs,
  usersInDb,
}
