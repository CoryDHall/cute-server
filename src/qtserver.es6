#!/usr/bin/env node
;{
const http = require('http')
    , url  = require('url')
    , path = require('path')
    , fs   = require('fs')
    , mime = require('mime')
    , mnm  = require('minimist')
    , clc  = require('cli-color')

const s = { delim: clc.xterm(200).bold
          , base: clc.xterm(200)
          , info: clc.xterm(181).bold
          , error: clc.whiteBright.redBright.bold
          , warning: clc.whiteBright.yellowBright.bold
          , success: clc.whiteBright.greenBright.bold
          , data: clc.xterm(81).bgBlack
          }
    , strDivider = clc.move(-10, 0) + new Array(3).fill("—").join('') + '>\t'

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
  ${s.base(strDivider)}  Started Serving "${s.data(uriPath)}" at ${s.info(new Date())}:
`)
  console.time(`\t\t\t${s.data(strDivider)} to Serve ${s.data(uriPath)}${clc.move.left(100)}`)

  handle(mappedFilePath)

  function handle(filePath, fallingback) {
    fs.stat(filePath, function returnFile(err, stat) {
      if (err) {

        console.log(`${s.error(strDivider)}  Unable to load "${s.data(mappedFilePath)}"`)

        if (err.code == 'ENOENT') {
          if (!(fallingback && uriPath !== relativeFallback) && fallbackPath) {
            let redirectPath = !fallToRoot ? relativeFallback : './'

            if (redirect) {
              console.log(`${s.warning(strDivider)}  Redirecting to "${s.data(redirectPath)}"`)

              res.writeHead(308, { Location: (redirectPath) })
              res.end()
              return
            } else {
              console.log(`${s.warning(strDivider)}  Attemping to serve "${s.data(redirectPath)}"`)

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
        console.time(`\t\t\t${s.data(strDivider)} to Load ${s.data(filePath)}${clc.move.left(100)}`)

        let contentType = mime.lookup(path.extname(filePath))
        res.writeHead(200, { 'Content-Type': contentType })
        fs.createReadStream(filePath).pipe(res)

        console.log(`${s.success(strDivider)}  Responding with "${s.data(filePath)}"\n`)
        console.timeEnd(`\t\t\t${s.data(strDivider)} to Load ${s.data(filePath)}${clc.move.left(100)}`)
        console.timeEnd(`\t\t\t${s.data(strDivider)} to Serve ${s.data(uriPath)}${clc.move.left(100)}`)
        console.log(s.base(`${strDivider}
  ${strDivider}\n\n`))

      }
    })
  }
}).listen(port)

console.log(s.base(`
  ${strDivider}Server running at:\t${s.data(`http://localhost:${port}/`)}
  ${strDivider}             root:\t${s.data(root)}
  ${strDivider}         fallback:\t${s.data(fallbackPath || "NONE")}
`))
}
