const express = require('express')
const multer = require('multer')
const {UPLOAD_PATH} =require('../utils/constant')
const Result = require('../models/Result')
const Book = require('../models/Book')
const router = express.Router()
const boom = require('boom')
const {decoded} = require('../utils')
const bookService = require('../services/book')

router.post(
  '/upload',
  multer({dest:`${UPLOAD_PATH}/book`}).single('file'),
  function(req,res,next){
    if(!req.file || req.file.length ===0){
      new Result('上传电子书失败').fail(res)
    }else{
      const book = new Book(req.file)
      book.parse().then(book =>{
        //console.log('book',book)
        new Result(book,'上传电子书成功').success(res)
      }).catch(err =>{
        next(boom.badImplementation(err))
      })
    }
  }
)

router.post(
  '/create',
  function(req,res,next){
    const decode = decoded(req)
    if(decode && decode.username){
      req.body.username = decode.username
    }
    const book = new Book(null,req.body)
    //console.log(book)
    bookService.insertBook(book).then(() =>{
      new Result('添加电子书成功').success(res)
    }).catch(err =>{
      next(boom.badImplementation(err))
    })
  }
)

router.get(
  '/get',
  (req,res,next)=>{
    const {filename} =req.query
    if(!filename){
      next(boom.badRequest(new Error('参数filename不能为空')))
    }else{
      bookService.getBook(filename).then(book=>{
        new Result(book,'获取图书信息成功').success(res)
      }).catch(err=>{
        next(boom.badImplementation(err))
      })
    }
  }
)

module.exports = router