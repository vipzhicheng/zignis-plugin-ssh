const { Utils } = require('zignis')
const { inquirer, fs } = Utils

const parse = require('url-parse')

const CFG_PATH = `${process.env.HOME}/.zignis/.ssh`
const CFG_TEMPLATE = 'ssh://${username}:${password}:${privateKeyFile}@${host}:${port} ${label}'

exports.command = 'add'
exports.desc =
  'Add or edit ssh accounts, same label account will be overridden.'

exports.builder = function(yargs) {
  yargs.option('key', {
    default: false,
    describe: 'Key to be used to encrypt and decrypt ssh accounts.'
  })
}

exports.handler = async function(argv) {
  argv.key =
    argv.key ||
    Utils._.get(Utils.getCombinedConfig(), 'commandDefault.ssh.key') ||
    ''

  await fs.ensureFileSync(CFG_PATH)
  let cfgData = fs.readFileSync(CFG_PATH, 'utf-8')
  if (!cfgData) {
    cfgData = []
  } else {
    cfgDtata = cfgData.split('\n')
  }

  let account
  if (cfgData.length > 0) {
    account = parse(cfgDtata[0].split(' ')[0])
    account.label = cfgDtata[0].split(' ')[1]
    if (account.auth.split(':')[2].length > 0) {
      account.privateKeyFile = account.auth.split(':')[2]
    }
  }

  console.log(account)

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'key',
      message: 'Enter key to encrypt the ssh account:',
      validate: answer => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        return true
      },
      when: answers => {
        if (!argv.key) {
          return true
        }
        return false
      },
    },
    {
      type: 'input',
      name: 'label',
      message: 'Enter a label to help you to remember:',
      validate: answer => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        return true
      },
      default: account ? account.label : undefined
    },
    {
      type: 'input',
      name: 'host',
      message: 'Enter a ssh host:',
      validate: answer => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        return true
      },
      default: account ? account.hostname : undefined
    },
    {
      type: 'input',
      name: 'port',
      message: 'Enter a ssh port: (default is 22)',
      default: account ? account.port : 22,
      filter: answer => {
        return answer ? Number(answer) : 22
      },
      validate: answer => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }

        if (!Utils._.isInteger(Number(answer)) || Number(answer) > 65535) {
          return 'Please provide a valid ssh port.'
        }

        return true
      },
      default: account ? account.port : undefined
    },
    {
      type: 'input',
      name: 'username',
      message: 'Enter a ssh username:',
      validate: answer => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }
        return true
      },
      default: account ? account.username : undefined
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter a ssh password: (input nothing if use private key)'
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
      when: answers => {
        if (answers.password.length === 0) {
          return false
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'privateKeyFile',
      message: 'Enter private key file path:',
      validate: answer => {
        if (answer.length === 0) {
          return 'Please enter at least one char.'
        }

        return true
      },
      when: answers => {
        if (answers.password.length === 0) {
          return true
        }
        return false
      },
      default: account ? account.privateKeyFile : undefined
    }
  ])

  cfgData.push(
    Utils._.template(CFG_TEMPLATE)({
      host: answers.host,
      port: answers.port,
      label: answers.label,
      username: answers.username,
      password: 'test'
    })
  )

  fs.writeFileSync(CFG_PATH, cfgData.join("\n"))
}
