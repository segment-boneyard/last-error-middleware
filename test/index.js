
var assert = require('assert');
var error = require('http-error');
var express = require('express');
var html = require('hbs').__express;
var lastError = require('..');
var request = require('supertest');

describe('last-error', function () {

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

  it('should return 401 json error for xhr requests', function (done) {
    var app = newApp();
    var errors = lastError();
    app.use(errors.thrown());
    app.use(errors.notFound());
    request(app)
      .get('/')
      .set({ 'X-Requested-With': 'xmlhttprequest' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(err.status)
      .end(function (err, res) {
        checkJson(res);
        done();
      });
  });

  it('should recognize application/json Accepts header', function (done) {
    var app = newApp();
    var errors = lastError();
    app.use(errors.thrown());
    app.use(errors.notFound());
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(err.status)
      .end(function (err, res) {
        checkJson(res);
        done();
      });
  });

  it('should optionally return the stack', function (done) {
    var app = newApp();
    var errors = lastError({ stack: true });
    app.use(errors.thrown());
    app.use(errors.notFound());
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(err.status)
      .end(function (err, res) {
        checkJson(res);
        assert(res.body.error.stack);
        done();
      });
  });

  it('should render 401 page', function (done) {
    var app = newApp();
    var errors = lastError({ pages: { '401': __dirname + '/401.html' }});
    app.use(errors.thrown());
    app.use(errors.notFound());
    request(app)
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200)
      .end(function (err, res) {
        assert(res.text.indexOf('<h1>401</h1>') !== -1);
        done();
      });
  });

  it('should catch 404 errors', function (done) {
    var app = newApp();
    var errors = lastError();
    app.use(errors.thrown());
    app.use(errors.notFound());
    request(app)
      .get('/not/found')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end(function (err, res) {
        var body = res.body;
        assert(body.error);
        assert(body.error.status === 404);
        assert(body.error.code === 'NOT_FOUND');
        done();
      });
  });
});