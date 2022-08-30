
let paginator = async (req, res, next) => {

  let page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
  let size = isNaN(parseInt(req.query.size)) ? 10: parseInt(req.query.size);

  let devMode = (page === 0 && size === 0);
  let validPage = (page >= 1);
  let validSize = (size >= 1 && size <= 200);

  if (!devMode) {
      if (validPage && validSize) {
          req.query.page = page;
          req.query.size = size;
          req.query.limit = size;
          req.query.offset = (page - 1) * size;
          req.query.devMode = devMode;
      } else {
          let error = new Error('Requires valid page and size params');
          next(error);
      }
  }

  next();
}

module.exports = paginator;
