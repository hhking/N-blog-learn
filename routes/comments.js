const express = require('express');
const router = express.Router();

const CommentModel = require('../models/comments');
const checkLogin = require('../middlewares/check').checkLogin;

// POST /comments 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
  const author = req.session.user._id;
  const { postId, content } = req.fields;

  // 校验参数
  try {
    if (!content.length) {
      throw new Error('请填写留言内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  const comment = {
    author,
    postId,
    content
  };

  CommentModel.create(comment).then(function () {
    req.flash('success', '留言成功');
    // 留言成功后跳转到上一页
    res.redirect('back');
  }).catch(next);
});

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
  const { commentId } = req.params;
  const author = req.session.user._id;

  CommentModel.findById(commentId).then(function (comment) {
    if (!comment) {
      throw new Error('留言不存在');
    }
    if (comment.author.toString() !== author.toString()) {
      throw new Error('没有权限删除留言');
    }
    CommentModel.findByIdAndRemove(commentId)
      .then(function () {
        req.flash('success', '删除留言成功');
        // 删除成功后跳转到上一页
        return res.redirect('back');
      }).catch(next);
  });
});

module.exports = router;
