const Book = require("../models/Book")
const db =require('../db')
const _ = require('lodash')

function exists(){
  return false
}
function removeBook(book){}
async function insertContents(book){
  const contents = book.getContents()
  if(contents && contents.length > 0){
    for(let i = 0;i<contents.length;i++){
      const _content = _.pick(contents[i],[
        'filename',
        'id',
        'href',
        'order',
        'level',
        'label',
        'pid',
        'navId'
      ])
      console.log('_content',_content)
      await db.insert(_content,'contents')
    }
  }
}
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