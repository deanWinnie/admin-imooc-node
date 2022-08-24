const { MIME_TYPE_EPUB ,UPLOAD_URL, UPLOAD_PATH} =require('../utils/constant')
const fs = require('fs')
const { resolve } = require('path')
const EPub = require('../utils/epub')
class Book{
  constructor(file,data) {
    if(file){
      this.createBookFromFile(file)
    }else{
      this.createBookFromData(data)
    }
  }
  createBookFromFile(file){
    console.log('createBookFromFile',file)
    const {
      destination,
      path,
      filename,
      originalname,
      mimetype = MIME_TYPE_EPUB
    } = file
    //电子书的后缀名
    const suffix = mimetype === MIME_TYPE_EPUB?'.epub':''
    //电子书的原有路径
    const oldBookPath = path
    //电子书的新路径
    const bookPath = `${destination}/${filename}${suffix}`
    //电子书的下载URL
    const url = `${UPLOAD_URL}/book/${filename}${suffix}`
    //电子书解压后的文件夹路径
    const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`
    //电子书解压后的文件夹URL
    const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`
    if(!fs.existsSync(unzipPath)){
      fs.mkdirSync(unzipPath,{recursive:true})
    }
    if(fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)){
      fs.renameSync(oldBookPath,bookPath)
    }
    this.filename = filename  //文件名
    this.path = `/book/${filename}${suffix}`  //equb文件相对路径
    this.filePath = this.path
    this.unzipPath = `/unzip/${filename}`  //equb解压后相对路径
    this.url = url //equb文件下载链接
    this.title = '' //书名
    this.author = '' //作者
    this.publisher = ''  //出版社
    this.contents = [] //目录
    this.cover = '' //封面图片URL
    this.coverPath = '' //封面图片的路径
    this.category = -1 //分类ID
    this.categoryText = '' //分类名称
    this.language = '' //语种
    this.unzipUrl = unzipUrl //解压后文件夹链接
    this.originalname = originalname //电子书文件的原名称
  }
  
  createBookFromData(data) {
  
  }
  parse(){
    return new Promise((resolve,reject) =>{
      const bookPath = `${UPLOAD_PATH}${this.filePath}`
      if(!fs.existsSync(bookPath)){
        reject(new Error('电子书不存在'))
      }
      const epub = new EPub(bookPath)
      epub.on('error',err =>{
        reject(err)
      })
      epub.on('end',err =>{
        if(err){
          reject(err)
        }else{
          console.log(epub.metadata)
          const {
            language,
            creator,
            creatorFileAs,
            title,
            cover,
            publisher
          } =epub.metadata
          if(!title){
            reject(new Error('图书标题为空'))
          }else{
            this.title = title
            this.language = language || 'en'
            this.author = creator || creatorFileAs || 'unknown'
            this.publisher = publisher || 'unknown'
            this.rootFile = epub.rootFile
            const handleGetImage = (err,file,mimeType)=>{
              if(err){
                reject(err)
              }else{
                const suffix = mimeType.split('/')[1]
                const coverPath = `${UPLOAD_PATH}/img/${this.filename}.${suffix}`
                const coverUrl = `${UPLOAD_URL}/img/${this.filename}.${suffix}`
                fs.writeFileSync(coverPath,file,'binary')
                resolve(this)
              }
            }
            epub.getImage(cover,handleGetImage)
          }
        }
      })
      epub.parse()
    })
  }
}

module.exports = Book 