
# last-error-middleware

  Middleware for catching the last express.js error and rendering it as json or an error page.

## Example

```js
var lastError = require('last-error-middleware');

app.use(lastError({ pages: { '500': __dirname + '/500.html' }});

```


## API

### lastError(options)
  
  Generate your own `last-error` middleware function with custom `options`. The defaults are:

```js
    {
      "json": true,   // force json responses
      "pages": {}     // status code to html template path
    }
```