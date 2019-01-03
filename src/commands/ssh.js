
exports.command = 'ssh'
exports.desc = 'ssh tool'
// exports.aliases = ''

exports.builder = function (yargs) {
  yargs.commandDir('ssh')
  // yargs.option('option', {default, describe, alias})
}

exports.handler = function (argv) {
  console.log('Start to draw your dream code!')
}