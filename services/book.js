const Book = require("../models/Book")
const db =require('../db')

function exists(){}
function removeBook(){}
function insertContents(){}
function insertBook(book){
  return new Promise((resolve,reject) =>{
    try{
      if(book instanceof Book){
        const res =exists(book)
        if(res){
          removeBook(nook)
          reject(new Error('电子书已存在'))
        }else{
          db.insert(book,'book')
          insertContents(book)
          resolve()
        }
      }else{
        reject(new Error('添加的图书对象不合法'))
      }
    }catch(e){
      reject(e)
    }
  })
}

module.exports = {
  insertBook
}