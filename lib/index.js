
var defaults = require('defaults');
var Emitter = require('events').EventEmitter;
var error = require('http-error');
var inherit = require('util').inherits;
var noop = function(){};

/**
 * Expose `LastError`.
 */

module.exports = LastError;


/**
 * Create a new last error middleware generator.
 *
 * @param {Object} options (optional)
 *   @property {Object} pages
 *   @property {Boolean} stack
 */

function LastError (options) {
  if (!(this instanceof LastError)) return new LastError(options);
  this.options = defaults(options, {
    pages: {},
    stack: false
  });
  // silence emitting 'error' from killing the program
  this.addListener('error', noop);
}


/**
 * Inherit from `Emitter`.
 */

inherit(LastError, Emitter);


/**
 * Generate a middleware designed to catch
 * all explicitly thrown middleware errors.
 *
 * @returns {Function}
 */

LastError.prototype.thrown = function () {
  var self = this;
  return function errorMiddleware (err, req, res, next) {
    self.handle(err, req, res, next);
  };
};


/**
 * Generate a middleware designed to catch
 * all fall-through requests and trigger a 404 error.
 *
 * @param {Object} options (optional)
 *   @property {Number} status
 *   @property {String} code
 *   @property {String} message
 * @returns {Function}
 */

LastError.prototype.notFound = function (options) {
  options = defaults(options, {
    status: 404,
    code: 'NOT_FOUND',
    message: 'Not found.'
  });

  var self = this;
  return function notFoundMiddleware (req, res, next) {
    var err = error(options.status, options.code, options.message);
    self.handle(err, req, res, next);
  };
};


/**
 * Handle an error in the middleware.
 *
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

LastError.prototype.handle = function (err, req, res, next) {
  this.emit('error', err);
  var pages = this.options.pages;
  var error = {
    code: err.code || 'INTERNAL',
    message: err.message || 'Internal error.',
    status: err.status || 500
  };

  if (this.options.stack) error.stack = err.stack;

  var page = pages[error.status] || pages[error.code];
  var header = req.get('Accept') || '';

  if (page && header.indexOf('html') !== -1) {
    res.status(error.status);
    res.setHeader('Content-Type', 'text/html');
    res.render(page, { error: error });
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.jsonp(error.status, { error: error });
  }
};