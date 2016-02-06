'use strict';

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime'),
    mnm = require('minimist'),
    log = require('./server_strings.js')();

var base = {},
    _running = new Map();

module.exports = base;

base.server = function server() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? mnm(process.argv.slice(2), { string: ['fallback'],
    boolean: ['redirect', 'fallback-to-root'],
    alias: { 'x': 'redirect',
      'r': 'root',
      'p': 'port',
      'f': 'fallback',
      'F': 'fallback-to-root'
    }
  }) : arguments[0];

  var _ref$port = _ref.port;
  var port = _ref$port === undefined ? 8000 : _ref$port;
  var _ref$root = _ref.root;
  var root = _ref$root === undefined ? process.cwd() : _ref$root;
  var redirect = _ref.redirect;
  var fallToRoot = _ref['fallback-to-root'];
  var relativeFallback = _ref.fallback;

  if (_running.get(port)) throw new Error('Cute Server already running on port ' + port);
  var fallbackPath = undefined;

  if (fallToRoot) {
    fallbackPath = root;
  } else if (relativeFallback) {
    fallbackPath = path.join(root, relativeFallback);
  }
  var CuteServer = http.createServer(function requestHandler(req, res) {
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
  });
  var self = { start: start,
    end: end
  };
  return self;
  function start() {
    CuteServer.listen(port);
    log.boot(port, root, fallbackPath);
    _running.set(port, self);
    return port;
  }
  function end() {
    CuteServer.close();
    return _running.delete(port);
  }
};
base.kill = function kill(port) {
  return _running.get(port) && _running.get(port).end();
};