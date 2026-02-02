module.exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(res, res, next)).catch(next);
};
