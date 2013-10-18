
var defaults = require('defaults');


/**
 * Expose `generate`.
 */

module.exports = generate;


/**
 * Generate a new last error middleware with `options`.
 *
 * @param {Object} options (optional)
 *   @property {Boolean} json
 *   @property {Object} pages
 */

function generate (options) {
  options = defaults(options, {
    json: false,
    pages: {}
  });

  var pages = options.pages;

  return function errorMiddleware (err, req, res, next) {
    var error = {
      code: err.code || 'INTERNAL',
      message: err.message || 'Internal error.',
      stack: err.stack,
      status: err.status || 500
    };
    var page = pages[error.status] || pages[error.code];

    if (req.xhr || options.json || !req.accepts('json') || !page) {
      res.setHeader('Content-Type', 'application/json');
      res.jsonp(error.status, { error: error });
    } else {
      res.status(error.status);
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.render(page, { error: error });
    }
  };
}