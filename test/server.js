const http = require('http')
const fs = require('fs')
const { parse, join } = require('path')
const indexHTML = join(__dirname, 'index.html')

http.createServer((req, res) => {
  const parsed = parse(req.url)
  try {
    if (~req.url.indexOf('favicon')) {
      res.end('')
    } else if (!parsed.base) {
      res.setHeader('content-type', 'text/html')
      fs.readFile(indexHTML, (err, data) => {
        if (!err) {
          res.end(data)
        } else {
          res.end(JSON.stringify(err, false, 2))
        }
      })
    } else {
      res.setHeader('content-type', parsed.ext === '.css'
        ? 'text/css'
        : 'text/javascript'
      )
      fs.readFile('.' + join(parsed.dir, parsed.base), (err, data) => {
        if (!err) {
          res.end(data)
        } else {
          res.end('document.write(\'' + JSON.stringify(err) + '\')')
        }
      })
    }
  } catch (e) {
    res.end('err')
  }
}).listen(process.env.NOW ? 80 : 8080)
