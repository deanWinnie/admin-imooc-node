const { MIME_TYPE_EPUB ,UPLOAD_URL, UPLOAD_PATH} =require('../utils/constant')
const fs = require('fs')
const path  = require('path')
const EPub = require('../utils/epub')
const { get } = require('http')
const xml2js = require('xml2js').parseString
class Book{
  constructor(file,data) {
    if(file){
      this.createBookFromFile(file)
    }else{
      this.createBookFromData(data)
    }
  }
  createBookFromFile(file){
    // console.log('createBookFromFile',file)
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
    this.contentsTree = [] //树装目录结构
    this.cover = '' //封面图片URL
    this.coverPath = '' //封面图片的路径
    this.category = -1 //分类ID
    this.categoryText = '' //分类名称
    this.language = '' //语种
    this.unzipUrl = unzipUrl //解压后文件夹链接
    this.originalName = originalname //电子书文件的原名称
  }
  
  createBookFromData(data) {
    this.filename = data.filename
    this.cover = data.cover
    this.title = data.title
    this.author = data.author
    this.publisher = data.publisher
    this.bookId = data.filename
    this.language = data.language
    this.originalName = data.originalName
    this.path = data.path || data.filePath
    this.filePath = data.path || data.filePath
    this.unzipPath = data.unzipPath
    this.coverPath = data.coverPath
    this.createUser = data.username
    this.createDt = new Date().getTime()
    this.updateDt = new Date().getTime()
    this.updateType = data.updateType === 0?data.updateType:1
    this.category = data.category || 99
    this.categoryText = data.categoryText || '自定义'
    this.contents = data.contents || []
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
                this.coverPath = `/img/${this.filename}.${suffix}`
                this.cover = coverUrl
                fs.writeFileSync(coverPath,file,'binary')
                resolve(this)
              }
            }
            try{
              this.unzip()
              this.parseContents(epub).then(({chapters,chapterTree}) =>{
                this.contents = chapters
                this.contentsTree = chapterTree
              })
              epub.getImage(cover,handleGetImage)
            } catch(e){
              reject(e)
            }
          }
        }
      })
      epub.parse()
    })
  }

  unzip(){
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(Book.genPath(this.path))
    zip.extractAllTo(Book.genPath(this.unzipPath),true) //解压后输出的地址
  }

  parseContents(epub){
    function getNcxFilePath(){
      const spine =epub && epub.spine
      const manifest = epub && epub.manifest
      const ncx = spine.toc && spine.toc.href
      const id = spine.toc && spine.toc.id
      if(ncx){
        return ncx
      }else{
        return manifest[id].href
      }
    }
    function findParent(array,level = 0, pid = ''){
      return array.map(item =>{
        item.level = level
        item.pid = pid
        if(item.navPoint && item.navPoint.length >0){
          item.navPoint = findParent(item.navPoint,level +1,item['$'].id)
        }else if(item.navPoint){
          item.navPoint.level = level +1
          item.navPoint.pid = item['$'].id
        }
        return item
      })
    }
    function flatten(array){
      return [].concat(...array.map(item =>{
        if(item.navPoint && item.navPoint.length >0){
          return [].concat(item,...flatten(item.navPoint))
        }else if(item.navPoint){
          return [].concat(item,item.navPoint)
        }
        return item
      }))
    }
    const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
    if(fs.existsSync(ncxFilePath)){
      return new Promise((resolve,reject) =>{
        const xml = fs.readFileSync(ncxFilePath,'utf-8')
        const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH,'')
        const filename = this.filename
        const unzipPath = this.unzipPath
        xml2js(xml,{
          explicitArray:false,
          ignoreAttrs:false
        },function(err,json){
          if(err){
            reject(err)
          }else{
           const navMap = json.ncx.navMap
           if(navMap.navPoint && navMap.navPoint.length > 0){
            navMap.navPoint = findParent(navMap.navPoint)
            const newNavMap = flatten(navMap.navPoint)
            const chapters = []
            newNavMap.forEach((chapter,index) =>{
              const src = chapter.content['$'].src
              chapter.id = `${src}`
              chapter.href = `${dir}/${src}`.replace(unzipPath,'')
              chapter.text = `${UPLOAD_URL}${dir}/${src}`
              chapter.label = chapter.navLabel.text || ''
              chapter.navId = chapter['$'].id
              chapter.filename = filename
              chapter.order = index+1
              chapters.push(chapter)
            })
            const chapterTree = []
            //console.log('nav',newNavMap)
            chapters.forEach(c=>{
              c.children = []
              if(c.pid === ''){
                chapterTree.push(c)
              }else{
                const parent = chapters.find( _ => _.navId === c.pid
                )
                parent.children.push(c)
              }
            })
            resolve({chapters,chapterTree})
           }else{
            reject(new Error('目录解析失败，目录数为0'))
           }
          }
        })
      })
    }else{
      throw new Error('目录文件不存在')
    }
  }

  toDb(){
    return{
      filename:this.filename,
      cover:this.cover,
      title:this.title,
      author:this.author,
      publisher:this.publisher,
      bookId:this.filename,
      language:this.language,
      originalName:this.originalName,
      filePath:this.path || this.filePath,
      unzipPath:this.unzipPath,
      coverPath:this.coverPath,
      createUser:this.createUser,
      createDt:this.createDt,
      updateDt:this.updateDt,
      updateType:this.updateType,
      category:this.category,
      categoryText:this.categoryText
    }
  }
  getContents(){
    return this.contents
  }
  /**
   * 删除文件
   */
  reset(){
    if(Book.pathExists(this.filePath)){
      fs.unlinkSync(Book.genPath(this.filePath))
    }
    if(Book.pathExists(this.coverPath)){
      fs.unlinkSync(Book.genPath(this.coverPath))
    }
    if(Book.pathExists(this.unzipPath)){
      //删除文件夹的时候需要使用rmdirSync
      fs.rmdirSync(Book.genPath(this.unzipPath),{recursive:true})
    }
  }
  static genPath(path){
    if(!path.startsWith('/')){
      path = `/${path}`
    }
    return `${UPLOAD_PATH}${path}`
  }
  /**
   * 
   * 判断路径是否存在
   */
  static pathExists(path){
    if(path.startsWith(UPLOAD_PATH)){
      return fs.existsSync(path)
    }else{
      return fs.existsSync(Book.genPath(path))
    }
  }
}

module.exports = Book 