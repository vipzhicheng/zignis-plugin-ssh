const funcs = require('./src/common/funcs')

module.exports = {
  async repl() {
    return {
      ssh: funcs
    }
  }
}