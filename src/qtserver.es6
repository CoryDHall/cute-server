#!/usr/bin/env node
;{
const http = require('http')
    , url  = require('url')
    , path = require('path')
    , fs   = require('fs')
    , mime = require('mime')
    , mnm  = require('minimist')

function strDivide() {
  return `${new Array(60).fill("—").join('')}`
}

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

  console.log(`
    \x1b[1m${strDivide()}\x1b[0m
    Started Serving "\x1b[1m${uriPath}\x1b[22m" at ${new Date()}:
    ${strDivide()}`)
  console.time(`    Served "\x1b[37m\x1b[1m${uriPath}\x1b[0m" in`)

  handle(mappedFilePath)

  function handle(filePath, fallingback) {
    fs.stat(filePath, function returnFile(err, stat) {
      if (err) {

        console.log(`    \x1b[31mUnable to load \x1b[0m"\x1b[1m${mappedFilePath}\x1b[22m"`)

        if (err.code == 'ENOENT') {
          if (!(fallingback && uriPath !== relativeFallback) && fallbackPath) {
            let redirectPath = !fallToRoot ? relativeFallback : './'

            if (redirect) {
              console.log(`    \x1b[35mRedirecting to \x1b[0m"\x1b[1m${redirectPath}\x1b[22m"`)

              res.writeHead(308, { Location: (redirectPath) })
              res.end()
              return
            } else {
              console.log(`    \x1b[35mAttemping to serve \x1b[0m"\x1b[1m${redirectPath}\x1b[22m"`)

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
        console.time(`    Loaded "\x1b[37m\x1b[1m${filePath}\x1b[0m" in`)

        let contentType = mime.lookup(path.extname(filePath))
        res.writeHead(200, { 'Content-Type': contentType })
        fs.createReadStream(filePath).pipe(res)

        console.log(`    \x1b[36mResponding with \x1b[0m"\x1b[1m${filePath}\x1b[22m"
    ${strDivide()}`)
        console.timeEnd(`    Loaded "\x1b[37m\x1b[1m${filePath}\x1b[0m" in`)
        console.timeEnd(`    Served "\x1b[37m\x1b[1m${uriPath}\x1b[0m" in`)
        console.log(`    \x1b[1m${strDivide()}
    ${strDivide()}\x1b[0m\n\n`)

      }
    })
  }
}).listen(port)

console.log(`
  ${strDivide()}
  \x1b[1mServer running at http://localhost:${port}/
    root: ${root}
    fallback: ${fallbackPath}\x1b[22m
  ${strDivide()}
`)
}