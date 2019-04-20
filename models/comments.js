const marked = require('marked');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  postId: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

CommentSchema.index({
  postId: 1,
  _id: 1
});

// 执行 find 之后把 comment 内容从 markdown 转成 content
CommentSchema.post('find', function (comments) {
  comments.map(function (comment) {
    comment.content = marked(comment.content);
    return comment;
  });
});

CommentSchema.post('findOne', function (comment) {
  comment.content = marked(comment.content);
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
