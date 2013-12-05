
var assert = require('assert');
var error = require('http-error');
var express = require('express');
var html = require('hbs').__express;
var lastError = require('..');
var request = require('supertest');
var noop = function (){};


var err = error(401, 'UNAUTHORIZED', 'Not authorized');

function newApp () {
  var app = express()
    .use(express.bodyParser())
    .engine('html', html)
    .set('views', __dirname);

  app.all('/', function (req, res, next) {
    return next(err);
  });

  return app;
}

function checkJson (res) {
  var body = res.body;
  assert(body.error);
  assert(body.error.code === err.code);
  assert(body.error.status === err.status);
  assert(body.error.message === err.message);
}

describe('last-error', function () {
  it('should return 401 json error for xhr requests', function (done) {
    var app = newApp().use(lastError());
    request(app)
      .get('/')
      .set({ 'X-Requested-With': 'xmlhttprequest' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(err.status)
      .end(function (err, res) {
        if (err) return done(err);
        checkJson(res);
        done();
      });
  });

  it('should recognize application/json Accepts header', function (done) {
    var app = newApp().use(lastError());
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(err.status)
      .end(function (err, res) {
        if (err) return done(err);
        checkJson(res);
        done();
      });
  });

  it('should optionally return the stack', function (done) {
    var app = newApp().use(lastError({ stack: true }));
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(err.status)
      .end(function (err, res) {
        if (err) return done(err);
        checkJson(res);
        assert(res.body.error.stack);
        done();
      });
  });

  it('should render 401 page', function (done) {
    var app = newApp().use(lastError({ pages: { '401': __dirname + '/401.html' }}));
    request(app)
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        assert(res.text.indexOf('<h1>401</h1>') !== -1);
        done();
      });
  });

  it('should catch 404 errors', function (done) {
    var app = newApp().use(lastError());
    request(app)
      .get('/not/found')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end(function (err, res) {
        if (err) return done(err);
        var body = res.body;
        assert(body.error);
        assert(body.error.status === 404);
        assert(body.error.code === 'NOT_FOUND');
        done();
      });
  });

  it('should emit errors', function (done) {
    var app = newApp();
    var errors = lastError();
    app.use(errors);
    errors.on('err', function (err) {
      assert(err);
      assert(err.status === 404);
      assert(err.code === 'NOT_FOUND');
      done();
    });
    request(app)
      .get('/not/found')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end(noop);
  });
});