#!/usr/bin/env node
'use strict';

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime'),
    mnm = require('minimist');

console.dir(http.STATUS_CODES);

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

  console.log('\n\n  Started Serving "\u001b[1m' + uriPath + '\u001b[22m" at ' + new Date() + ':');
  console.time('Served "\u001b[37m\u001b[1m' + uriPath + '\u001b[0m" in');
  handle(mappedFilePath);

  function handle(filePath, fallingback) {
    fs.stat(filePath, function (err, stat) {
      if (err) {
        console.log('\t\u001b[31mUnable to load \u001b[0m"\u001b[1m' + mappedFilePath + '\u001b[22m"');
        if (err.code == 'ENOENT') {
          if (!fallingback && fallbackPath) {
            console.log('\t\u001b[35mAttemping to serve \u001b[0m"\u001b[1m' + (relativeFallback || '/') + '\u001b[22m"');
            return handle(fallbackPath, true);
          }
          res.statusCode = 404;
        } else res.statusCode = 500;
        res.end();
        console.error(err);
      } else if (stat.isDirectory()) {
        handle(path.join(filePath, 'index.html'));
      } else {
        console.time('Loaded "\u001b[37m\u001b[1m' + filePath + '\u001b[0m" in');
        var contentType = mime.lookup(path.extname(filePath));
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        console.log('\t\u001b[36mResponding with \u001b[0m"\u001b[1m' + filePath + '\u001b[22m"' + strDivide() + '\n');
        console.timeEnd('Loaded "\u001b[37m\u001b[1m' + filePath + '\u001b[0m" in');
        console.timeEnd('Served "\u001b[37m\u001b[1m' + uriPath + '\u001b[0m" in');
      }
    });
  }
  function strDivide() {
    return '\n' + new Array(60).fill("=").join('');
  }
}).listen(port);

console.log('\u001b[1mServer running at http://localhost:' + port + '/ [root: ' + root + ', fallback: ' + fallbackPath + ']\u001b[22m');