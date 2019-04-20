# N-blog-learn

根据 [N-blog](https://github.com/nswbmw/N-blog) 过了一遍 Node，之前接触过的也算回顾了一下。

没有完全按照教程，做了一些更改。
- `ejs` 模板引擎替换成 `handlerbars`([express-handlebars](https://github.com/ericf/express-handlebars))。Handlebars 是 logic-less 的引擎，所以少不了要写一些 `helpers`。
- 时间处理库 `moment` 替换成 [dayjs](https://github.com/iamkun/dayjs) (不过最后没有用到)
- MongoDB 驱动库 `Mongolass` 替换成 [mongoose](https://github.com/Automattic/mongoose)。主要是因为之前用过 `mongoose`，`N-blog` 作者自己写的 `Mongolass` 看起来是更易用点。

