// 权限控制，登录验证
module.exports = {
  // 登录验证，未登录跳转到登录页
  checkLogin: function (req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录');
      return res.redirect('/signin');
    }
    next();
  },
  // 未登录验证，已登录访问登录页返回上一页
  checkNotLogin: function (req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录');
      return res.redirect('back');
    }
    next();
  }
};
