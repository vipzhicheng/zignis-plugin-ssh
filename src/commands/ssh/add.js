const { Utils } = require('zignis')
const { inquirer } = Utils

exports.command = 'add'
exports.desc = 'Add or edit ssh accounts, same label account will be overridden.'

exports.builder = function (yargs) {
  yargs.option('key', { default: false, describe: 'Key to be used to encrypt and decrypt ssh accounts.' })
}

exports.handler = async function (argv) {
  argv.key = argv.key || Utils._.get(Utils.getCombinedConfig(), 'commandDefault.ssh.key') || ''

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'key',
      message: 'Please provide your key which will be used to encrypt and decrypt ssh accounts:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please input at least one char.'
        }
        return true
      },
      when: (answers) => {
        if (!argv.key) {
          return true
        }
        return false
      }
    },
    {
      type: 'input',
      name: 'label',
      message: 'Please input a label to help you remember what it is about:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please input at least one char.'
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'host',
      message: 'Please input a ssh host:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please input at least one char.'
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'port',
      message: 'Please input a ssh port: (default is 22)',
      filter: (answer) => {
        return Number(answer)
      },
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please input at least one char.'
        }

        if (!Utils._.isInteger(Number(answer)) || Number(answer) > 65535) {
          return 'Please provide a valid ssh port.'
        }

        return true
      }
    },
    {
      type: 'input',
      name: 'username',
      message: 'Please input a ssh username:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please input at least one char.'
        }
        return true
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Please input a ssh password:',
    },
    {
      type: 'password',
      name: 'password_confirm',
      message: 'Please confirm the password you just input:',
      validate: (answer, answers) => {
        if (answer.length === 0) {
          return 'Please input at least one char.'
        }
        if (answers.password !== answer) {
          return 'Password not match with previous one.'
        }
        return true
      },
      when: (answers) => {
        if (answers.password.length === 0) {
          return false
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'private_key',
      message: 'Please input where your private key file locate:',
      validate: (answer) => {
        
        if (answer.length === 0) {
          return 'Please input at least one char.'
        }

        return true
      },
      when: (answers) => {
        if (answers.password.length === 0) {
          return true
        }
        return false
      }
    },

    console.log(answers)
    
  ])

  console.log(answers)



}
