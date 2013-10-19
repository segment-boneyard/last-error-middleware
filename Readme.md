# last-error-middleware

  Middleware for catching the last `express.js` error and rendering it as json or an error page.

## Installation

    $ npm install last-error-middleware

## Example

```js
var lastError = require('last-error-middleware');

app.use(lastError({ pages: { 
  '401': 'path/to/401.html',
  '500': 'path/to/500.html',
  '503': 'path/to/503.html'
}});

```

For `404` support, add a simple catch-all route that throws a `404` error right before you mount `last-error`:

```js
var lastError = require('last-error-middleware');
var error = require('http-error');

app.use(function (req, res, next) {
  next(error(404, 'NOT_FOUND', 'Page not found.'))
});

app.use(lastError({ pages: {
  '404': 'path/to/404.html'
}});
```

## API

### lastError(options)
  
  Generate your own `last-error` middleware function with custom `options`. The defaults are:

```js
{
  "json": false,  // force json responses
  "pages": {}     // status code to html template path
}
```
