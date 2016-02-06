const http = require('http')
    , url  = require('url')
    , path = require('path')
    , fs   = require('fs')
    , mime = require('mime')
    , mnm  = require('minimist')
    , log  = require('./server_strings.js')()

const base = {}
    , _running = new Map()

module.exports = base

base.server = function server({
      port=8000
    , root=process.cwd()
    , redirect
    , 'fallback-to-root': fallToRoot
    , fallback: relativeFallback
    } = mnm(process.argv.slice(2)
          , { string: ['fallback']
            , boolean: ['redirect', 'fallback-to-root']
            , alias:  { 'x': 'redirect'
                      , 'r': 'root'
                      , 'p': 'port'
                      , 'f': 'fallback'
                      , 'F': 'fallback-to-root'
                      }
            }
          )) {

  if(_running.get(port)) throw new Error(`Cute Server already running on port ${port}`)
  let fallbackPath

  if (fallToRoot) {
    fallbackPath = root
  } else if (relativeFallback) {
    fallbackPath = path.join(root, relativeFallback)
  }
  const CuteServer = http.createServer(function requestHandler(req, res) {
    let uriPath  = url.parse(req.url).pathname
    , mappedFilePath = path.join(root, unescape(uriPath))

    log.start(uriPath);

    handle(mappedFilePath)

    function handle(filePath, fallingback) {
      fs.stat(filePath, function returnFile(err, stat) {
        if (err) {

          log.fail(mappedFilePath)

          if (err.code == 'ENOENT') {
            if (!(fallingback && uriPath !== relativeFallback) && fallbackPath) {
              let redirectPath = !fallToRoot ? relativeFallback : './'

              if (redirect) {
                log.redirect(redirectPath)

                res.writeHead(308, { Location: (redirectPath) })
                res.end()
                return
              } else {
                log.attempt(redirectPath)

                return handle(fallbackPath, true)
              }
            }
            res.statusCode = 404

          } else res.statusCode = 500

          res.end()
          // console.error(err)

        } else if (stat.isDirectory()) {
          handle(path.join(filePath, 'index.html'))

        } else {
          log.loadStart(filePath)

          let contentType = mime.lookup(path.extname(filePath))
          res.writeHead(200, { 'Content-Type': contentType })
          fs.createReadStream(filePath).pipe(res)

          log.complete(uriPath, filePath)
        }
      })
    }
  })
  let self = { start
             , end
             }
  return self
  function start() {
    CuteServer.listen(port)
    log.boot(port, root, fallbackPath)
    _running.set(port, self)
    return port
  }
  function end() {
    CuteServer.close()
    return _running.delete(port)
  }
}
base.kill = function kill(port) {
  return _running.get(port) && _running.get(port).end()
}
