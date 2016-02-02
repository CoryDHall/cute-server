#!/usr/bin/env node
const http = require('http')
    , url  = require('url')
    , path = require('path')
    , fs   = require('fs')
    , mime = require('mime')
    , mnm  = require('minimist');

const {
    p: port=8000,
    r: root=process.cwd(),
    f: relativeFallback
    } = mnm(process.argv.slice(2));

let fallbackPath;

if (relativeFallback) fallbackPath = path.join(root, relativeFallback);

http.createServer(function requestHandler(req, res) {
  let uriPath  = url.parse(req.url).pathname,
      mappedFilePath = path.join(root, unescape(uriPath));

  console.log(`\n\n  Started Serving "\x1b[1m${uriPath}\x1b[22m" at ${new Date()}:`);
  console.time(`Served "\x1b[37m\x1b[1m${uriPath}\x1b[0m" in`);
  handle(mappedFilePath);

  function handle(filePath, fallingback) {
    fs.stat(filePath, function(err, stat) {
      if (err) {
        console.log(`\t\x1b[31mUnable to load \x1b[0m"\x1b[1m${mappedFilePath}\x1b[22m"`);
        if (err.code == 'ENOENT') {
          if (!fallingback && fallbackPath) {
            console.log(`\t\x1b[35mAttemping to serve \x1b[0m"\x1b[1m${relativeFallback}\x1b[22m"`);
            return handle(fallbackPath, true);
          }
          res.statusCode = 404;
        }
        else res.statusCode = 500;
        res.end();
        console.error(err);
      }

      else if (stat.isDirectory()) {
        handle(path.join(filePath, 'index.html'));
      }

      else {
        console.time(`Loaded "\x1b[37m\x1b[1m${filePath}\x1b[0m" in`);
        let contentType = mime.lookup(path.extname(filePath));
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        console.log(`\t\x1b[36mResponding with \x1b[0m"\x1b[1m${filePath}\x1b[22m"${strDivide()}\n`);
        console.timeEnd(`Loaded "\x1b[37m\x1b[1m${filePath}\x1b[0m" in`);
        console.timeEnd(`Served "\x1b[37m\x1b[1m${uriPath}\x1b[0m" in`);
      }
    });
  }
  function strDivide() { return `\n${new Array(60).fill("=").join('')}` }
}).listen(port);

console.log(`\x1b[1mServer running at http://localhost:${port}/ [root: ${root}, fallback: ${fallbackPath}]\x1b[22m`)
