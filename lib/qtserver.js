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
        log = require('./server_strings.js')();

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

      log.start(uriPath);

      handle(mappedFilePath);

      function handle(filePath, fallingback) {
        fs.stat(filePath, function returnFile(err, stat) {
          if (err) {

            log.fail(mappedFilePath);

            if (err.code == 'ENOENT') {
              if (!(fallingback && uriPath !== relativeFallback) && fallbackPath) {
                var redirectPath = !fallToRoot ? relativeFallback : './';

                if (redirect) {
                  log.redirect(redirectPath);

                  res.writeHead(308, { Location: redirectPath });
                  res.end();
                  return;
                } else {
                  log.attempt(redirectPath);

                  return handle(fallbackPath, true);
                }
              }
              res.statusCode = 404;
            } else res.statusCode = 500;

            res.end();
            // console.error(err)
          } else if (stat.isDirectory()) {
              handle(path.join(filePath, 'index.html'));
            } else {
              log.loadStart(filePath);

              var contentType = mime.lookup(path.extname(filePath));
              res.writeHead(200, { 'Content-Type': contentType });
              fs.createReadStream(filePath).pipe(res);

              log.complete(uriPath, filePath);
            }
        });
      }
    }).listen(port);

    log.boot(port, root, fallbackPath);
  })();
}