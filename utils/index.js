// const crypto = require('crypto')

// function md5(s){
//     console.log(1111)
//     return crypto.createHash('md5').update(String(s)).digest('hex');
// }

const crypto = require('crypto')

function md5(s) {
  // 注意参数需要为 String 类型，否则会出错
  return crypto.createHash('md5')
    .update(String(s)).digest('hex');
}

module.exports = {
    md5
}