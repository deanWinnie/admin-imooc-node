const Book = require("../models/Book")
const db =require('../db')

function exists(){
  return false
}
function removeBook(){}
function insertContents(){}
function insertBook(book){
  return new Promise(async(resolve,reject) =>{
    try{
      if(book instanceof Book){
        const res =await exists(book)
        if(res){
          await removeBook(nook)
          reject(new Error('电子书已存在'))
        }else{
          await db.insert(book.toDb(),'book')
          await insertContents(book)
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