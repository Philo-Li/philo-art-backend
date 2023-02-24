/* eslint-disable no-underscore-dangle */
// const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/Photo');
const User = require('../models/User');
const config = require('../config');

const api = supertest(app);
let token;

jest.setTimeout(30000);
jest.useFakeTimers();

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('123456', 10);
  const user = new User({
    username: 'admin',
    name: 'admin',
    passwordHash,
  });
  const savedUser = await user.save();
  const userForToken = {
    username: savedUser.username,
    id: savedUser.id,
  };
  token = await jwt.sign(userForToken, config.SECRET);

  // eslint-disable-next-line no-restricted-syntax
  for (const blog of helper.initialBlogs) {
    blog.user = savedUser.id;
    const blogObject = new Blog(blog);
    // eslint-disable-next-line no-await-in-loop
    await blogObject.save();
  }
});

describe('HTTP GET', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('blogs length', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('whether the unique identifier named id', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
  });
});

describe('HTTP POST', () => {
  test('blogs length plus 1', async () => {
    const newBlog = new Blog({
      title: 'Type w111',
      author: 'Robert C. Martin111',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    });

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
  });

  test('If post request lack the attributes with "title" and "url", return 400 Bad Request', async () => {
    const newBlog = {
      author: 'Kathy',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('If post request lack the "likes" attribute, set it to 0', async () => {
    const newBlog = {
      title: 'Type w111',
      author: 'Kathy',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200);

    const response = await api.get('/api/blogs');
    const newPost = response.body[helper.initialBlogs.length];

    expect(newPost.likes).toBe(0);
  });
});

describe('HTTP DELETE', () => {
  test('blogs deleted one object', async () => {
    const id = helper.initialBlogs[0]._id;
    await api
      .delete(`/api/blogs/${id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204);

    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length - 1);
  });
});

describe('HTTP PUT', () => {
  test('blogs updated one object\'s like', async () => {
    const updatedBlog = { ...helper.initialBlogs[0], likes: 123 };
    await api
      .put(`/api/blogs/${updatedBlog._id}`)
      .set('Authorization', `bearer ${token}`)
      .send(updatedBlog);

    const response = await api.get('/api/blogs');
    expect(response.body[0].likes).toBe(123);
  });
});

// afterAll(() => {
//   mongoose.connection.close();
// });
