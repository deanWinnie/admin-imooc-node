const Book = require("../models/Book")
const db =require('../db')
const _ = require('lodash')

function exists(book){
  const { title,author,publisher } = book
  const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}
async function removeBook(book){
  if(book){
    book.reset()
    if(book.filename){
      const removeBookSql = `delete from book where filename='${book.filename}'`
      const removeContentsSql = `delete from contents where filename='${book.filename}'`
      await db.querySql(removeBookSql)
      await db.querySql(removeContentsSql)
    }
  }
}
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
          await removeBook(book)
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

function getBook(filename){
  return new Promise(async(resolve,reject)=>{
    const bookSql = `select * from book where filename='${filename}'`
    const contentsSql = `select * from contents where filename='${filename}' order by \`order\``
    const book = await db.queryOne(bookSql)
    const contents = await db.queryOne(contentsSql)
    resolve(book)
  })
}
module.exports = {
  insertBook,
  getBook
}