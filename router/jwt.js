const { expressjwt: jwt } = require('express-jwt')
const {PRIVATE_KEY} = require('../utils/constant')

module.exports = jwt({
  secret:PRIVATE_KEY,
  algorithms: ["HS256"],
  credentialRequired:true //设置为false的话解除jwt验证
}).unless({
  path:[
    '/',
    '/user/login'
  ]
})