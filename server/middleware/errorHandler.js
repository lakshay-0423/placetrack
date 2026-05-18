const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate field value"
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Server Error"
  });
};

module.exports = errorHandler;