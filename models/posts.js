const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentModel = require('./comments');

const PostSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  pv: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'update_at'
  }
});

// 按创建时间降序查看用户的文章列表
PostSchema.index({
  author: 1,
  _id: -1
});

// find 之后添加钩子：计算出文章下的评论数
PostSchema.post('find', function (posts) {
  return Promise.all(posts.map(function (post) {
    return CommentModel.find({
      postId: post._id
    }).then(function (comment) {
      post.commentsCount = comment.length;
      return post;
    });
  }));
});

PostSchema.post('findOne', function (post) {
  CommentModel.find({
    postId: post._id
  }).then(function (comment) {
    post.commentsCount = comment.length;
  });
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
