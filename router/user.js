const express = require('express')
const Result = require('../models/Result')
const {querySql} =require('../db')

const router = express.Router()

router.post('/login', function(req, res, next) {
  console.log(req.body)
  const {username,password} =req.body
  querySql('select * from admin_user').then(res =>{
    console.log(res)
  }).catch(err =>{
    console.log(err)
  })
  if(username =='admin'&&password == '111111'){
    new Result({token:'aksjdakgdshagdhj'},'登录成功').success(res)
  }else{
    new Result('账号密码错误').fail(res)
  }
})
router.get('/info', function(req, res, next) {
  res.json('user info...')
})

module.exports = router