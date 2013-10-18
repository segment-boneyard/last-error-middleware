
# last-error-middleware

  Middleware for catching the last `express.js` error and rendering it as json or an error page.

## Installation

    $ npm install last-error-middleware

## Example

```js
var lastError = require('last-error-middleware');

app.use(lastError({ pages: { '500': __dirname + '/500.html' }});

```

and for 404 support:

```js
var lastError = require('last-error-middleware');
var error = require('http-error');

app.get('/', ..)

// add 404 support
app.use(function (req, res, next) {
  next(error(404, 'NOT_FOUND', 'Page not found.'))
});

app.use(lastError({ pages: {
  '404': __dirname + '/404.html',
  '500': __dirname + '/500.html'
}});
```

## API

### lastError(options)
  
  Generate your own `last-error` middleware function with custom `options`. The defaults are:

```js
{
  "json": false,   // force json responses
  "pages": {}     // status code to html template path
}
```