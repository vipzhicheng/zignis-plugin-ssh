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
      message: 'Enter key to encrypt the ssh account:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
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
      message: 'Enter a label to help you to remember:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'host',
      message: 'Enter a ssh host:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'port',
      message: 'Enter a ssh port: (default is 22)',
      default: 22,
      filter: (answer) => {
        return answer ? Number(answer) : 22
      },
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
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
      message: 'Enter a ssh username:',
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        return true
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter a ssh password: (input nothing if use private key)',
    },
    {
      type: 'password',
      name: 'password_confirm',
      message: 'Confirm the password you just enter:',
      validate: (answer, answers) => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        if (answers.password !== answer) {
          return 'Confirmed password not match.'
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
      message: 'Enter private key file path:',
      validate: (answer) => {
        
        if (answer.length === 0) {
          return 'Please enter at least one char.'
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

  ])

  console.log(answers)



}
