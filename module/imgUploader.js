/*Express默认并不处理HTTP请求体中的数据，对于普通请求体(JSON、二进制、字符串)数据，可以使用body-parser中间件。
而文件上传(multipart/form-data请求)，可以基于请求流处理，也可以使用formidable模块或Multer中间件。
Multer在解析完请求体后，会向Request对象中添加一个body对象用来存放随表单提交的普通数据，
并且还会向Request对象中添加一个一个file或files对象来存放经过Multer中间件处理过后的文件对象。
*/
/*本模块定义一个处理上传图片的中间件*/
var multer = require("multer");
var path = require("path");
var fs = require('fs');


//multer参数一：上传的文件过滤设置
var fileFilter = function (req, file, cb) {
    var acceptableMime = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    // 限制类型
    // null是固定写法
    if (acceptableMime.indexOf(file.mimetype) !== -1) {
      console.log('通过上传验证')
	  console.log(req.body)
	  cb(null, true); // 通过上传
    } else {
		console.log('禁止上传')
      cb(null, false); // 禁止上传
    }
  }

//multer参数二：上传的文件存储路径设置为，/public/upload/房源id ,房源的id需要向数据库中插入数据生成
var storage = multer.diskStorage({
  //设置 上传图片保存到服务器位置
  //destination: path.resolve(__dirname, "./public/upload"), //destination可以直接以字符串作为参数，也可以以函数作为参数
  destination: function (req, file, cb) {    
	let savePath = path.resolve(__dirname, "../public/upload/"+req.body.publisher_uid) // public/upload目录必须先存在，下面不会递归创建，只会创建一层
    if (!fs.existsSync(savePath)){ //保存目录不存在则先创建该目录
        fs.mkdirSync(savePath);
    }	
	cb(null, savePath) //第二个参数是当前文件保存的目录，该目录如果不存在不会自动创建需要手动创建
  },
  //设置 上传文件保存的文件名
  filename: function (req, file, cb) {
  // 获取后缀扩展
    let extName = file.originalname.slice(file.originalname.lastIndexOf("."));  //.jpg
 // 获取名称,Date.now();是一个当前毫秒数，即把唯一随机数作为保存的文件名。
    let fileName = Date.now(); 
    console.log(fileName + extName); //12423543465.jpg
    cb(null, fileName + extName); //第二个参数是要保存的文件名称
  },
});

//multer参数三：可选，上传文件大小限制设置
var limits = {
    fieldSize: "3MB", //设置限制（可选）
  }
  
//图片上传中间件导出对象，接收任何name域的所有图片
module.exports = multer({  
					  fileFilter,
					  storage,
					  limits
					}).any();

