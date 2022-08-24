const { env } =require('./env');
const UPLOAD_PATH = env ==='dev'?'D:/upload/admin-upload/ebook':'/root/upload/admin-upload/ebook';
const UPLOAD_URL = env ==='dev'?'http://localhost:8089/':'http://localhost:8089/';

module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  CODE_TOKEN_EXPIRED:-2,
  debug:true,
  PWD_SALT: 'admin_imooc_node',
  PRIVATE_KEY:'mywen_deanwinnie',
  JWT_EXPIRED:60 * 60,
  UPLOAD_PATH,
  UPLOAD_URL,
  MIME_TYPE_EPUB:'application/epub'
}