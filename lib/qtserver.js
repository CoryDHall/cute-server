#!/usr/bin/env node
'use strict';

;{
  (function () {
    var http = require('http'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        mime = require('mime'),
        mnm = require('minimist'),
        clc = require('cli-color');

    var s = { delim: clc.xterm(200).bold,
      base: clc.xterm(200),
      info: clc.xterm(181).bold,
      error: clc.whiteBright.redBright.bold,
      warning: clc.whiteBright.yellowBright.bold,
      success: clc.whiteBright.greenBright.bold,
      data: clc.xterm(81).bgBlack
    },
        strDivider = clc.move(-10, 0) + new Array(3).fill("—").join('') + '>\t';

    var _mnm = mnm(process.argv.slice(2), { string: ['fallback'],
      boolean: ['redirect', 'fallback-to-root'],
      alias: { 'x': 'redirect',
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

      console.log('\n  ' + s.base(strDivider) + '  Started Serving "' + s.data(uriPath) + '" at ' + s.info(new Date()) + ':\n');
      console.time('\t\t\t' + s.data(strDivider) + ' to Serve ' + s.data(uriPath) + clc.move.left(100));

      handle(mappedFilePath);

      function handle(filePath, fallingback) {
        fs.stat(filePath, function returnFile(err, stat) {
          if (err) {

            console.log(s.error(strDivider) + '  Unable to load "' + s.data(mappedFilePath) + '"');

            if (err.code == 'ENOENT') {
              if (!(fallingback && uriPath !== relativeFallback) && fallbackPath) {
                var redirectPath = !fallToRoot ? relativeFallback : './';

                if (redirect) {
                  console.log(s.warning(strDivider) + '  Redirecting to "' + s.data(redirectPath) + '"');

                  res.writeHead(308, { Location: redirectPath });
                  res.end();
                  return;
                } else {
                  console.log(s.warning(strDivider) + '  Attemping to serve "' + s.data(redirectPath) + '"');

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
            console.time('\t\t\t' + s.data(strDivider) + ' to Load ' + s.data(filePath) + clc.move.left(100));

            var contentType = mime.lookup(path.extname(filePath));
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);

            console.log(s.success(strDivider) + '  Responding with "' + s.data(filePath) + '"\n');
            console.timeEnd('\t\t\t' + s.data(strDivider) + ' to Load ' + s.data(filePath) + clc.move.left(100));
            console.timeEnd('\t\t\t' + s.data(strDivider) + ' to Serve ' + s.data(uriPath) + clc.move.left(100));
            console.log(s.base(strDivider + '\n  ' + strDivider + '\n\n'));
          }
        });
      }
    }).listen(port);

    console.log(s.base('\n  ' + strDivider + 'Server running at:\t' + s.data('http://localhost:' + port + '/') + '\n  ' + strDivider + '             root:\t' + s.data(root) + '\n  ' + strDivider + '         fallback:\t' + s.data(fallbackPath || "NONE") + '\n'));
  })();
}