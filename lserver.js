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
var fallbackPath = _mnm.f;

if (fallbackPath) fallbackPath = path.join(root, fallbackPath);

http.createServer(function requestHandler(req, res) {
  var uriPath = url.parse(req.url).pathname,
      filePath = path.join(root, unescape(uriPath));

  console.log('Serving ' + uriPath);
  handle(filePath);

  function handle(filePath, fallingback) {
    fs.stat(filePath, function (err, stat) {
      if (err) {
        if (err.code == 'ENOENT') {
          if (!fallingback && fallbackPath) return handle(fallbackPath, true);
          res.statusCode = 404;
        } else res.statusCode = 500;
        res.end();
        console.error(err);
      } else if (stat.isDirectory()) {
        handle(path.join(filePath, 'index.html'));
      } else {
        var contentType = mime.lookup(path.extname(filePath));
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      }
    });
  }
}).listen(port);

console.log('Server running at http://localhost:' + port + '/' + ' [root: ' + root + ', fallback: ' + fallbackPath + ']');