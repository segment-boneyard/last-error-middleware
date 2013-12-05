
var defaults = require('defaults');
var error = require('http-error');
var express = require('express');


/**
 * Expose `generate`.
 */

module.exports = generate;


/**
 * Return a new last error express app for mounting.
 *
 * @param {Object} options (optional)
 *   @property {Object} pages
 *   @property {Boolean} stack
 * @return {Express}
 */

function generate (options) {
  options = defaults(options || {}, {
    pages: {},
    stack: false
  });

  var app = express();

  /**
   * Last error middleware.
   *
   * @param {Error} err
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   */

  function lastError (err, req, res, next) {
    app.emit('err', err);

    var header = req.get('Accept') || '';
    var pages = options.pages;
    var error = {
      code: err.code || 'INTERNAL',
      message: err.message || 'Internal error.',
      status: err.status || 500
    };

    if (options.stack) error.stack = err.stack;

    var page = pages[error.code] || pages[error.status] || pages['*'];
    if (page && header.indexOf('html') !== -1) {
      res.setHeader('Content-Type', 'text/html');
      res.render(page, { error: error });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.jsonp(error.status, { error: error });
    }
  }

  app.on('mount', function (parent) {
    parent
      .use(notFound)
      .use(lastError);
  });

  return app;
}


/**
 * Not found error middleware.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

function notFound (req, res, next) {
  next(error(404, 'NOT_FOUND', 'Not found.'));
}