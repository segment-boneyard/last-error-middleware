# last-error-middleware

  Middleware for catching the last `express.js` error and rendering it as json or an error page.

## Installation

    $ npm install last-error-middleware

## Example

```js
var lastError = require('last-error-middleware');

var errors = lastError({ pages: {
  '401': 'path/to/401.html',
  '404': 'path/to/404.html',
  '500': 'path/to/500.html',
  '503': 'path/to/503.html'
});

app.use(errors.thrown());
app.use(errors.notFound());
```

#### Why is `404` separate?

A request that passes through all the middleware without a response is not considered an error by express, so it is not passed to a normal 4-arity error middleware.

For `404` support, add a simple catch-all middleware that throws a `404` error if the request doesn't receive a response.

```js
app.use(errors.thrown());
// note: this must come after `errors.thrown()`
app.use(errors.notFound());
```

## API

### .LastError(options)
  
  Construct a `last-error` middleware generator with custom `options`. The defaults are:

```js
{
  "pages": {},     // status code to html template path
  "stack": false   // return the error stack with json responses
}
```

### .thrown()

  Generate a middleware designed to catch all explicitly thrown errors.

### .notFound(options)

  Generate a middleware designed to catch all fall-through requests and designate them as 404 errors.

  Specify the 404 error specifics using the custom `options`, which default to:

```js
{
  status: 404,
  code: 'NOT_FOUND',
  message: 'Not found.'
}
```

### on('error', ..)

  Emitted on every error.

```js
var lastError = require('last-error-middleware');

var errors = lastError({ pages: {
  '401': 'path/to/401.html',
  '404': 'path/to/404.html',
  '500': 'path/to/500.html',
  '503': 'path/to/503.html'
});

app.use(errors.thrown());
app.use(errors.notFound());

errors.on('error', function (err) {
  console.log(err.stack);
});
```