const parse = require('url-parse')
const crypto = require('crypto')
const algorithm = 'rc4'

exports.encrypt = function (text, key){
  const cipher = crypto.createCipher(algorithm, key)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
exports.decrypt = function (text, key){
  const decipher = crypto.createCipher(algorithm, key)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

exports.parseLine = (line) => {
  let account = parse(line.substring(0, line.indexOf(' ')))
  account.label = line.substring(line.indexOf(' ')).trim()
  if (account.auth.split(':')[2].length > 0) {
    account.privateKeyFile = account.auth.split(':')[2]
    account.password = ''
  } else {
    account.privateKeyFile = ''
  }

  return account
}