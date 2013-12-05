
# last-error-middleware

  Middleware for catching the last `express.js` error and rendering it as json or an error page.

## Installation

    $ npm install last-error-middleware

## Example

```js
var lastError = require('last-error-middleware');

app.use(lastError({ pages: {
  '401': 'path/to/401.html',
  '404': 'path/to/404.html',
  '500': 'path/to/500.html',
  '503': 'path/to/503.html',
  '*'  : 'path/to/omg.html',
}));
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

### on('err', ..)

  Emitted on every error.

```js
var lastError = require('last-error-middleware');

var errors = lastError({ pages: {
  '401': 'path/to/401.html',
  '404': 'path/to/404.html',
  '500': 'path/to/500.html',
  '503': 'path/to/503.html'
});

app.use(errors);

errors.on('err', function (err) {
  console.log(err.stack);
});
```

## License

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```
