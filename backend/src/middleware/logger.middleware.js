function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${method} ${url} ${status} ${duration}ms`);
  });

  next();
}

module.exports = { logger };
