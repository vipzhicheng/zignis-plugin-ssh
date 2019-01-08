const { Utils } = require('zignis')
const { inquirer, fs } = Utils
const parse = require('url-parse')

const CFG_PATH = `${process.env.HOME}/.zignis/.ssh`
const CFG_TEMPLATE = 'ssh://${username}:${password}:${privateKeyFile}@${host}:${port} ${label}'
const CFG_VIEW_TEMPLATE = 'ssh://${username}@${host}:${port} ${label}'

const crypto = require('crypto')
const algorithm = 'rc4'

const encrypt = function (text, key){
  const cipher = crypto.createCipher(algorithm, key)
  let crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
const decrypt = function (text, key){
  const decipher = crypto.createCipher(algorithm, key)
  let dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}


exports.command = 'ssh <op> [keywords..]'
exports.desc = 'ssh tool'

exports.builder = function (yargs) {
  yargs.option('key', {
    default: false,
    describe: 'Key to be used to encrypt and decrypt ssh accounts.'
  })
}

exports.handler = async function (argv) {
  if (['add', 'edit', 'list', 'delete', 'login'].indexOf(argv.op) === -1) {
    Utils.error(`Invalid operation: ${argv.op}!`)
  }

  argv.key =
    argv.key ||
    Utils._.get(Utils.getCombinedConfig(), 'commandDefault.ssh.key') ||
    ''

  await fs.ensureFileSync(CFG_PATH)
  let cfgData = fs.readFileSync(CFG_PATH, 'utf-8')
  if (!cfgData) {
    cfgData = []
  } else {
    cfgData = cfgData.trim().split('\n')
  }

  cfgFiltered = cfgData.filter(line => {
    return argv.keywords.every(keyword => line.indexOf(keyword) > -1)
  })

  let chooseAccount
  if (cfgFiltered.length > 1) {
    const accountChoose = await inquirer.prompt([
      {
        type: 'list',
        name: 'chooseAccount',
        message: 'Choose an account to continue',
        choices: cfgFiltered.map(line => {
          let account = parse(line.substring(0, line.indexOf(' ')))
          account.label = line.substring(line.indexOf(' ')).trim()
          if (account.auth.split(':')[2].length > 0) {
            account.privateKeyFile = account.auth.split(':')[2]
            account.password = ''
          }

          return {
            value: line,
            name: Utils._.template(CFG_VIEW_TEMPLATE)({
              host: account.hostname,
              port: account.port,
              username: account.username,
              label: account.label
            })
          }

        })
      }
    ])
    chooseAccount = accountChoose.chooseAccount
  } else if (cfgFiltered.length === 1) {
    chooseAccount = cfgFiltered[0]
  }

  const chooseAccountIndex = cfgData.indexOf(chooseAccount)
  let account
  if (chooseAccount) {
    account = parse(chooseAccount.substring(0, chooseAccount.indexOf(' ')))
    account.label = chooseAccount.substring(chooseAccount.indexOf(' ')).trim()
    if (account.auth.split(':')[2].length > 0) {
      account.privateKeyFile = account.auth.split(':')[2]
      account.password = ''
    }
  }

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
      default: account ? account.label : argv.keywords.join(' ')
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
      name: 'passwordConfirm',
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

  argv.key = Utils.md5(argv.key || answers.key)

  if (chooseAccountIndex === -1) {
    cfgData.push(
      Utils._.template(CFG_TEMPLATE)({
        host: answers.host,
        port: answers.port,
        label: answers.label,
        username: answers.username,
        password: answers.password ? encrypt(answers.password, argv.key) : '',
        privateKeyFile: answers.privateKeyFile ? encrypt(answers.privateKeyFile, argv.key) : '' 
      })
    )
  } else {
    cfgData[chooseAccountIndex] = Utils._.template(CFG_TEMPLATE)({
      host: answers.host,
      port: answers.port,
      label: answers.label,
      username: answers.username,
      password: answers.password ? encrypt(answers.password, argv.key) : '',
      privateKeyFile: answers.privateKeyFile ? encrypt(answers.privateKeyFile, argv.key) : '' 
    })
  }
  

  fs.writeFileSync(CFG_PATH, cfgData.join("\n"))
}