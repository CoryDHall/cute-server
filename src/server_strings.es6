const clc = require('cli-color')

const s = { delim: clc.xterm(200).bold
  , base: clc.xterm(200)
  , info: clc.xterm(181).bold
  , error: clc.whiteBright.redBright.bold
  , warning: clc.whiteBright.yellowBright.bold
  , success: clc.whiteBright.greenBright.bold
  , data: clc.xterm(81).bgBlack
}
, strDivider = clc.move(-10, 0) + new Array(3).fill("—").join('') + '>\t'

const strings = {
  boot(port, root, fallbackPath) {
    return s.base(`
      ${strDivider}Server running at:\t${s.data(`http://localhost:${port}/`)}
      ${strDivider}             root:\t${s.data(root)}
      ${strDivider}         fallback:\t${s.data(fallbackPath || "NONE")}
      `)
  },
  begin(uriPath) {
    return `
    ${s.base(strDivider)}  Started Serving "${s.data(uriPath)}" at ${s.info(new Date())}:
  `
  },
  serveTimer(uriPath) {
    return `\t\t\t${(strDivider)} to Serve ${s.data(uriPath)}${clc.move.left(100)}`
  },
  loadTimer(filePath) {
    return `\t\t\t${(strDivider)} to Load ${s.data(filePath)}${clc.move.left(100)}`
  },
  loadError(mappedFilePath) {
    return `${s.error(strDivider)}  Unable to load "${s.data(mappedFilePath)}"`
  },
  redirect(redirectPath) {
    return `${s.warning(strDivider)}  Redirecting to "${s.data(redirectPath)}"`
  },
  reattempt(redirectPath) {
    return `${s.warning(strDivider)}  Attemping to serve "${s.data(redirectPath)}"`
  },
  success(filePath) {
    return `${s.success(strDivider)}  Responding with "${s.data(filePath)}"\n`
  },
  procDiv() {
    return s.base(`${strDivider}
${strDivider}\n\n`)
  },
}, blocks = {
  boot(port, root, fallbackPath) {
    console.log(strings['boot'](port, root, fallbackPath))
  },
  start(uriPath) {
    console.log(strings['begin'](uriPath))
    console.time(strings['serveTimer'](uriPath))
  },
  fail(mappedFilePath) {
    console.log(strings['loadError'](mappedFilePath))
  },
  loadStart(filePath) {
    console.time(strings['loadTimer'](filePath))
  },
  attempt(redirectPath) {
    console.log(strings['reattempt'](redirectPath))
  },
  redirect(redirectPath) {
    console.log(strings['redirect'](redirectPath))
  },
  complete(uriPath, filePath) {
    console.log(strings['success'](filePath))
    console.timeEnd(strings['loadTimer'](filePath))
    console.timeEnd(strings['serveTimer'](uriPath))
    console.log(strings['procDiv']())
  }
}
module.exports = function (templateName,...data) {
  if (templateName === undefined) {
    return blocks
  }
  return strings[templateName](...data)
}
