#!/usr/bin/env node
;{
const http = require('http')
    , url  = require('url')
    , path = require('path')
    , fs   = require('fs')
    , mime = require('mime')
    , mnm  = require('minimist')
    , out  = require('./server_strings.js')

const { port=8000
      , root=process.cwd()
      , redirect
      , 'fallback-to-root': fallToRoot
      , fallback: relativeFallback
      } = mnm(process.argv.slice(2)
            , { string: ['fallback']
              , boolean: ['redirect', 'fallback-to-root']
              , alias: { 'x': 'redirect'
                       , 'r': 'root'
                       , 'p': 'port'
                       , 'f': 'fallback'
                       , 'F': 'fallback-to-root'
                       }
              }
            )

let fallbackPath

if (fallToRoot) {
  fallbackPath = root
} else if (relativeFallback) {
  fallbackPath = path.join(root, relativeFallback)
}
http.createServer(function requestHandler(req, res) {
  let uriPath  = url.parse(req.url).pathname
    , mappedFilePath = path.join(root, unescape(uriPath))

  console.log(out('begin', uriPath))
  console.time(out('serveTimer', uriPath))

  handle(mappedFilePath)

  function handle(filePath, fallingback) {
    fs.stat(filePath, function returnFile(err, stat) {
      if (err) {

        console.log(out('loadError', mappedFilePath))

        if (err.code == 'ENOENT') {
          if (!(fallingback && uriPath !== relativeFallback) && fallbackPath) {
            let redirectPath = !fallToRoot ? relativeFallback : './'

            if (redirect) {
              console.log(out('redirect', redirectPath))

              res.writeHead(308, { Location: (redirectPath) })
              res.end()
              return
            } else {
              console.log(out('reattempt', redirectPath))

              return handle(fallbackPath, true)
            }
          }
          res.statusCode = 404

        } else res.statusCode = 500

        res.end()
        console.error(err)

      } else if (stat.isDirectory()) {
        handle(path.join(filePath, 'index.html'))

      } else {
        console.time(out('loadTimer', filePath))

        let contentType = mime.lookup(path.extname(filePath))
        res.writeHead(200, { 'Content-Type': contentType })
        fs.createReadStream(filePath).pipe(res)

        console.log(out('success', filePath))
        console.timeEnd(out('loadTimer', filePath))
        console.timeEnd(out('serveTimer', uriPath))
        console.log(out('procDiv'))

      }
    })
  }
}).listen(port)

console.log(out('boot', port, root, fallbackPath))
}
