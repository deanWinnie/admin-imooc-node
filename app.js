const express =require("express");
const router =require('./router')
const bodyParser = require('body-parser')
const cors = require('cors')

const app =express()

app.use(cors())//用作跨域
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use("/",router)
// function myLogger(req,res,next){
//     console.log("Mylogger")
//     next()
// }
// app.use(myLogger);

// app.get('/',function(req,res){
//     // res.send('hello node');
//     throw new Error('error....')
// })

// function errorHandler(err,req,res,next){
//     console.log(err);
//     res.status(500).json({
//         error:-1,
//         msg:err.toString()
//     })
// }
// app.use(errorHandler)

const server = app.listen(5000,function(){
    console.log(server.address())
    const{address,port}=server.address()
    console.log('HTTP服务启动成功 http://%s:%s',address,port);
})