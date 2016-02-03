#!/usr/bin/env node
'use strict';

;{
  (function () {
    var strDivide = function strDivide() {
      return '' + new Array(60).fill("—").join('');
    };

    var http = require('http'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        mime = require('mime'),
        mnm = require('minimist');

    var _mnm = mnm(process.argv.slice(2), {
      string: ['fallback'],
      boolean: ['redirect', 'fallback-to-root'],
      alias: {
        'x': 'redirect',
        'r': 'root',
        'p': 'port',
        'f': 'fallback',
        'F': 'fallback-to-root'
      }
    });

    var _mnm$port = _mnm.port;
    var port = _mnm$port === undefined ? 8000 : _mnm$port;
    var _mnm$root = _mnm.root;
    var root = _mnm$root === undefined ? process.cwd() : _mnm$root;
    var redirect = _mnm.redirect;
    var fallToRoot = _mnm['fallback-to-root'];
    var relativeFallback = _mnm.fallback;

    var fallbackPath = undefined;

    if (fallToRoot) {
      fallbackPath = root;
    } else if (relativeFallback) {
      fallbackPath = path.join(root, relativeFallback);
    }
    http.createServer(function requestHandler(req, res) {
      var uriPath = url.parse(req.url).pathname,
          mappedFilePath = path.join(root, unescape(uriPath));

      console.log('\n    \u001b[1m' + strDivide() + '\u001b[0m\n    Started Serving "\u001b[1m' + uriPath + '\u001b[22m" at ' + new Date() + ':\n    ' + strDivide());
      console.time('    Served "\u001b[37m\u001b[1m' + uriPath + '\u001b[0m" in');
      handle(mappedFilePath);

      function handle(filePath, fallingback) {
        fs.stat(filePath, function (err, stat) {
          if (err) {
            console.log('    \u001b[31mUnable to load \u001b[0m"\u001b[1m' + mappedFilePath + '\u001b[22m"');
            if (err.code == 'ENOENT') {
              if (!(fallingback && uriPath !== relativeFallback) && fallbackPath) {
                var redirectPath = !fallToRoot ? relativeFallback : './';
                if (redirect) {
                  console.log('    \u001b[35mRedirecting to \u001b[0m"\u001b[1m' + redirectPath + '\u001b[22m"');
                  res.writeHead(308, {
                    Location: redirectPath
                  });
                  res.end();
                  return;
                } else {
                  console.log('    \u001b[35mAttemping to serve \u001b[0m"\u001b[1m' + redirectPath + '\u001b[22m"');
                  return handle(fallbackPath, true);
                }
              }
              res.statusCode = 404;
            } else res.statusCode = 500;
            res.end();
            console.error(err);
          } else if (stat.isDirectory()) {
            handle(path.join(filePath, 'index.html'));
          } else {
            console.time('    Loaded "\u001b[37m\u001b[1m' + filePath + '\u001b[0m" in');
            var contentType = mime.lookup(path.extname(filePath));
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
            console.log('    \u001b[36mResponding with \u001b[0m"\u001b[1m' + filePath + '\u001b[22m"\n    ' + strDivide());
            console.timeEnd('    Loaded "\u001b[37m\u001b[1m' + filePath + '\u001b[0m" in');
            console.timeEnd('    Served "\u001b[37m\u001b[1m' + uriPath + '\u001b[0m" in');
            console.log('    \u001b[1m' + strDivide() + '\n    ' + strDivide() + '\u001b[0m\n\n');
          }
        });
      }
    }).listen(port);

    console.log('\n  ' + strDivide() + '\n  \u001b[1mServer running at http://localhost:' + port + '/\n    root: ' + root + '\n    fallback: ' + fallbackPath + '\u001b[22m\n  ' + strDivide() + '\n');
  })();
}