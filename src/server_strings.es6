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
  }
}
module.exports = function (templateName,...data) {
  return strings[templateName](...data)
}
