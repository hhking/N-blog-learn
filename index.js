const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');
const exphbs = require('express-handlebars');
const hbsHelpers = require('./lib/helpers');
const expressFormidable = require('express-formidable');
const winston = require('winston');
const expressWinston = require('express-winston');

// 连接数据库
mongoose.connect(config.mongodb, {
  useNewUrlParser: true,
  useCreateIndex: true
}, error => {
  if (error) {
    console.log('connect to %s error', config.mongodb, error.message);
    process.exit(1);
  }
});

const app = express();
const viewPath = path.join(__dirname, 'views');

app.set('views', viewPath);
app.engine('hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: hbsHelpers
}));
app.set('view engine', 'hbs');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session 中间件
app.use(session({
  name: config.session.key,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.maxAge
  },
  store: new MongoStore({
    url: config.mongodb
  })
}));

app.use(flash());

// express-formidable 处理表单数据，普通数据挂在在 req.fields, 文件挂在在 req.files
app.use(expressFormidable({
  uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
  keepExtensions: true // 保留后缀
}));

// 设置模板全局变量
// res.locals 优先级高于 app.locals，res.locals 上通常挂载变量信息（每次请求可可能的值都不一样），app.locals 通常挂载常量信息
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();

  next();
});

// 正常请求日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));
// 路由
routes(app);
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// 错误处理
app.use(function (err, req, res, next) {
  console.error(err);
  req.flash('error', err.message);
  res.redirect('/posts');
});

if (module.parent) {
  // module.parent: 最先引用该模块的模块
  // 通过 require 方式引入，则导出 app，用于测试
  module.exports = app;
} else {
  // 直接执行 index.js 则监听端口，启动程序
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`);
  });
}
