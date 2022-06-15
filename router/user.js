const express = require('express')
const Result = require('../models/Result')
const {querySql} =require('../db')
const {login} = require('../services/user')
const {md5} = require('../utils')
const { PWD_SALT } = require('../utils/constant')

const router = express.Router()

router.post('/login', function(req, res, next) {
    let {username,password} =req.body
    console.log(password)
    password = md5(`${password}${PWD_SALT}`)
    console.log(password)
    login(username,password).then(user=>{
        if(!user || user.length == 0){
            new Result('登录失败').fail(res)
        }else{
            new Result('登录成功').success(res)
        }
    })
})
router.get('/info', function(req, res, next) {
    res.json('user info...')
})

module.exports = router