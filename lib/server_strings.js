'use strict';

var clc = require('cli-color');

var s = { delim: clc.xterm(200).bold,
  base: clc.xterm(200),
  info: clc.xterm(181).bold,
  error: clc.whiteBright.redBright.bold,
  warning: clc.whiteBright.yellowBright.bold,
  success: clc.whiteBright.greenBright.bold,
  data: clc.xterm(81).bgBlack
},
    strDivider = clc.move(-10, 0) + new Array(3).fill("—").join('') + '>\t';

var strings = {
  boot: function boot(port, root, fallbackPath) {
    return s.base('\n      ' + strDivider + 'Cute Server running at:\t' + s.data('http://localhost:' + port + '/') + '\n      ' + strDivider + '                  root:\t' + s.data(root) + '\n      ' + strDivider + '              fallback:\t' + s.data(fallbackPath || "NONE") + '\n      ');
  },
  begin: function begin(uriPath) {
    return '\n    ' + s.base(strDivider) + '  Started Serving "' + s.data(uriPath) + '" at ' + s.info(new Date()) + ':\n  ';
  },
  serveTimer: function serveTimer(uriPath) {
    return '\t\t\t' + strDivider + ' to Serve ' + s.data(uriPath) + clc.move.left(100);
  },
  loadTimer: function loadTimer(filePath) {
    return '\t\t\t' + strDivider + ' to Load ' + s.data(filePath) + clc.move.left(100);
  },
  loadError: function loadError(mappedFilePath) {
    return s.error(strDivider) + '  Unable to load "' + s.data(mappedFilePath) + '"';
  },
  redirect: function redirect(redirectPath) {
    return s.warning(strDivider) + '  Redirecting to "' + s.data(redirectPath) + '"';
  },
  reattempt: function reattempt(redirectPath) {
    return s.warning(strDivider) + '  Attemping to serve "' + s.data(redirectPath) + '"';
  },
  success: function success(filePath) {
    return s.success(strDivider) + '  Responding with "' + s.data(filePath) + '"\n';
  },
  procDiv: function procDiv() {
    return s.base(strDivider + '\n' + strDivider + '\n\n');
  }
},
    blocks = {
  boot: function boot(port, root, fallbackPath) {
    console.log(strings['boot'](port, root, fallbackPath));
  },
  start: function start(uriPath) {
    console.log(strings['begin'](uriPath));
    console.time(strings['serveTimer'](uriPath));
  },
  fail: function fail(mappedFilePath) {
    console.log(strings['loadError'](mappedFilePath));
  },
  loadStart: function loadStart(filePath) {
    console.time(strings['loadTimer'](filePath));
  },
  attempt: function attempt(redirectPath) {
    console.log(strings['reattempt'](redirectPath));
  },
  redirect: function redirect(redirectPath) {
    console.log(strings['redirect'](redirectPath));
  },
  complete: function complete(uriPath, filePath) {
    console.log(strings['success'](filePath));
    console.timeEnd(strings['loadTimer'](filePath));
    console.timeEnd(strings['serveTimer'](uriPath));
    console.log(strings['procDiv']());
  }
};
module.exports = function (templateName) {
  if (templateName === undefined) {
    return blocks;
  }

  for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    data[_key - 1] = arguments[_key];
  }

  return strings[templateName].apply(strings, data);
};