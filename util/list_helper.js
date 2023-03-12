const dummy = (blogs) => {
  blogs
  return (1)
}

const totalLikes = (blogs) => {
  const summation = (accum, curr) => {
    return accum + curr.likes
  }
  return blogs.length === 0 ? 0 : blogs.reduce(summation, 0)
}

const favoriteBlog = (blogs) => {
//   const maximum = (accum, curr) => {
//     if (curr.likes > accum){
//       return curr.likes
//     }
//   }
//   blogs.reduce(maximum, 0)
  let favorite = { likes: -1 }
  blogs.forEach((blog) => {
    if (blog.likes > favorite.likes){
      favorite = {
        title : blog.title,
        author: blog.author,
        likes: blog.likes
      }
    }
  })
  return blogs.length === 0 ? {} : favorite
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
