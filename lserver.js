#!/usr/bin/env node
'use strict';

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime'),
    mnm = require('minimist');

var _mnm = mnm(process.argv.slice(2));

var _mnm$p = _mnm.p;
var port = _mnm$p === undefined ? 8000 : _mnm$p;
var _mnm$r = _mnm.r;
var root = _mnm$r === undefined ? process.cwd() : _mnm$r;
var relativeFallback = _mnm.f;

var fallbackPath = undefined;

if (relativeFallback) fallbackPath = path.join(root, relativeFallback);

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
            console.log('\t\u001b[35mAttemping to serve \u001b[0m"\u001b[1m' + relativeFallback + '\u001b[22m"');
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