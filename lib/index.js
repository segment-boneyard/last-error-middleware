
var defaults = require('defaults');


/**
 * Expose `generate`.
 */

module.exports = generate;


/**
 * Generate a new last error middleware with `options`.
 *
 * @param {Object} options (optional)
 *   @property {Object} pages
 */

function generate (options) {
  options = defaults(options, {
    pages: {}
  });

  var pages = options.pages;

  return function errorMiddleware (err, req, res, next) {
    var error = {
      code: err.code || 'INTERNAL',
      message: err.message || 'Internal error.',
      status: err.status || 500
    };
    var page = pages[error.status] || pages[error.code];

    if (req.xhr || req.accepts('json') || !page) {
      res.setHeader('Content-Type', 'application/json');
      res.jsonp(error.status, { error: error });
    } else {
      res.status(error.status);
      res.setHeader('Content-Type', 'text/html');
      res.render(page, { error: error });
    }
  };
}