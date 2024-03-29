const mysql = require('mysql');
const config = require('./config')
const {debug} = require('../utils/constant')
const {isObject} = require('../utils/index')


function connect(){
    return mysql.createConnection({
        host:config.host,
        user:config.user,
        password:config.password,
        database:config.database,
        multipleStatements:true
    })
}

//查询多个用户，返回一个数组
function querySql(sql) {
    const conn = connect()
    debug && console.log(sql)
    return new Promise((resolve,reject) =>{
        try{
            conn.query(sql,(err,res) =>{
                if(err){
                    debug && console.log('查询失败，原因:' + JSON.stringify(err))
                    reject(err)
                }else{
                    debug && console.log('查询成功', JSON.stringify(res))
                    resolve(res)
                }
            })
        }catch(e){
            reject(e)
        }finally{
            conn.end()
        }
    })
}

//查询单条数据，返回一个数组
function queryOne(sql) {
  return new Promise((resolve,reject) =>{
    querySql(sql).then(res =>{
      if(res && res.length > 0){
        resolve(res[0])
      }else{
        resolve(null)
      }
    }).catch(err =>{
      reject(err)
    })
  })
}

function insert(model,tableName){
  return new Promise((resolve,reject) =>{
    if(!isObject(model)){
      reject(new Error(`插入数据库失败，插入数据非对象`))
    }else{
      const keys =[]
      const values = []
      Object.keys(model).forEach(key =>{
        if(model.hasOwnProperty(key)){
          keys.push(`\`${key}\``)
          values.push(`'${model[key]}'`)
        }
      })
      if(keys.length > 0 && values.length > 0){
        let sql =`INSERT INTO \`${tableName}\` (`
        const keyString = keys.join(',')
        const valuesString = values.join(',')
        sql = `${sql}${keyString}) VALUES (${valuesString})`
        debug && console.log(sql)
        const conn =connect()
        try{
          conn.query(sql, (err,res)=>{
            if(err){
              reject(err)
            }else{
              resolve(res)
            }
          })
        } catch(e){
          reject(e)
        } finally{
          conn.end()
        }
      } else {
        reject(new Error('插入数据库失败，对象中没有任何属性'))
      }
    }
  })
}

module.exports = {
    querySql,
    queryOne,
    insert
}