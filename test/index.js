
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
    app.use(lastError());
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
    app.use(lastError());
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

  it('should render 401 page', function (done) {
    var app = newApp();
    app.use(lastError({ pages: { '401': __dirname + '/401.html' }}));
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
});