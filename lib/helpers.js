exports.renderGender = function (gender) {
  return { m: '男', f: '女', x: '保密' }[gender];
};

exports.toStringEqual = function (left, right, options) {
  return left.toString() === right.toString() ? options.fn(this) : options.inverse(this);
};
