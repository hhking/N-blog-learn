const express = require('express');
const marked = require('marked');
const router = express.Router();

const PostModel = require('../models/posts');
const CommentModel = require('../models/comments');
const checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有用户或者特定用户的文章页 eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  const { author } = req.query;
  const query = {};

  if (author) {
    query.author = author;
  }

  PostModel.find(query)
    .populate({
      path: 'author',
      model: 'User'
    })
    .sort({
      _id: -1
    })
    .then(function (posts) {
      posts.map(function (post) {
        post.content = marked(post.content);
        return post;
      });
      res.render('posts', {
        posts
      });
    })
    .catch(next);
});

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id;
  const { title, content } = req.fields;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  let post = {
    author,
    title,
    content
  };

  PostModel.create(post)
    .then(function (post) {
      req.flash('success', '发表成功');
      res.redirect(`/posts/${post._id}`);
    }).catch(next);
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create');
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
  const { postId } = req.params;

  Promise.all([
    PostModel.findById(postId).populate({
      path: 'author',
      model: 'User'
    }),
    CommentModel.find({
      postId
    }).populate({
      path: 'author',
      model: 'User'
    }).sort({
      _id: 1
    }),
    PostModel.updateOne({
      _id: postId
    }, {
      // 使用 $inc 使 pv 每次自加 1
      $inc: {
        pv: 1
      }
    })
  ]).then(function (result) {
    const post = result[0];
    const comments = result[1];
    if (!post) {
      throw new Error('该文章不存在');
    }
    post.content = marked(post.content);
    res.render('post', {
      post,
      comments
    });
  }).catch(next);
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const { postId } = req.params;
  const author = req.session.user._id;

  PostModel.findById(postId).populate({
    path: 'author',
    model: 'User'
  }).then(function (post) {
    if (!post) {
      throw new Error('该文章不存在');
    }
    if (author.toString() !== post.author._id.toString()) {
      throw new Error('权限不足');
    }

    res.render('edit', {
      post
    });
  }).catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const { postId } = req.params;
  const author = req.session.user._id;
  const { title, content } = req.fields;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  PostModel.findById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在');
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限');
      }

      PostModel.findByIdAndUpdate(postId, {
        title,
        content
      }).then(function (post) {
        req.flash('success', '编辑文章成功');
        // 编辑成功后跳转到上一页
        res.redirect(`/posts/${postId}`);
      }).catch(next);
    });
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const { postId } = req.params;
  const author = req.session.user._id;

  PostModel.findById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在');
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限');
      }

      PostModel.findByIdAndRemove(postId)
        .then(function (post) {
          console.log(post);
          // 文章删除后，再删除该文章下的所有留言
          CommentModel.deleteMany({
            postId
          }).then(function () {
            req.flash('success', '删除文章成功');
            // 删除成功后跳转到主页
            res.redirect('/posts');
          }).catch(next);
        });
    });
});

module.exports = router;
