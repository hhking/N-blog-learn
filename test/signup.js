const path = require('path');
const assert = require('assert');
const request = require('supertest');
const app = require('../index');
const User = require('../models/users');

const testName1 = 'testName1';
const testName2 = 'nswbmw';

describe('signup', function () {
  describe('POST /signup', function () {
    const agent = request.agent(app);
    // runs before each test in this block
    beforeEach(function (done) {
      // 创建一个用户
      User.create({
        name: testName1,
        password: '123456',
        avatar: path.join(__dirname, 'avatar.jpeg'),
        gender: 'x',
        bio: 'bio'
      }).then(function () {
        done();
      }).catch(done);
    });

    // runs after each test in this block
    afterEach(function (done) {
      // 删除测试用户
      User.deleteMany({ name: { $in: [testName1, testName2] } }).then(function (res) {
        done();
      }).catch(done);
    });

    // runs after all tests in this block
    after(function (done) {
      process.exit();
    });

    // 用户名错误的情况
    it('wrong name', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: '' })
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(res.text.match(/名字请限制在 1-10 个字符/));
          done();
        });
    });

    // 性别错误的情况
    it('wrong gender', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: testName2, gender: 'a' })
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(res.text.match(/性别只能是 m、f 或 x/));
          done();
        });
    });

    // 用户名被占用的情况
    it('duplicate name', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(res.text.match(/用户名已被占用/));
          done();
        });
    });

    // 注册成功的情况
    it('success', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(res.text.match(/注册成功/));
          done();
        });
    });
  });
});
