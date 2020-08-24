const express = require('express')
const bodyParser = require('body-parser')
const path=require('path')
const my_sql = require('./module/my_sql.js')
//const favicon = require('serve-favicon')
const app = express()
const port = 8080

//server.use(objMulter.any());
//开放静态资源的访问，将以 /static/xxx开头的请求，在public目录下面去找对应的静态资源响应请求
app.use('/static', express.static(path.join(__dirname, 'public')))
//app.use(favicon(path.join(__dirname, '/public/img/favicon.ico')))//网站图标
//请求体解析器配置
app.use(bodyParser.json()) //解析json类型请求体
//app.use(bodyParser.urlencoded({ extended: true }) ) //解析form data类型请求体
app.use(bodyParser.urlencoded({ extended: false }));  //不解析form data类型请求体，文件上传时为formdata请求体

//CORS跨域请求配置
app.all('*', function (req, res, next) {
  console.log('hello world')
  res.header('Access-Control-Allow-Origin', '*'); //允许所有跨域请求
//Access-Control-Allow-Methods，设置允许跨域客户端请求的方法
  res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS');
  //Access-Control-Allow-Headers ,设置允许跨域客户端的请求中请求头类型,所以前端自定义的请求头必须在下面进行设置，前端的请求才允许跨域。
  res.header("Access-Control-Allow-Headers",
    "Content-Type,Content-Length, Authorization, Accept,X-Requested-With,Access-Control-Allow-Origin,mytoken");
  
  res.header('Content-Type', 'application/json;charset=utf-8' );
  
  if(req.method=='OPTIONS'){ //对于跨域OPTIONS嗅探请求进行放行
	  res.sendStatus(200)
  }else{
	  next();
  }
  
});

/*根据功能模块挂载不同的路由中间件*/
app.use('/user',require('./routers/user.js'));
app.use('/house',require('./routers/house.js'));
app.use('/demand',require('./routers/demand.js'));
app.use('/trust',require('./routers/trust.js'));
app.use('/',require('./routers/main.js'));


// app.get('/6516165', (req, res) => {		
// 	(async ()=>{
// 		let sql = 'select phone, username from user where uid = ?'
// 		let params = [1]
// 		/*
// 		await保证在async函数闭包内，await代码之后的代码不会异步执行，必须等到await操作得到结果才会继续往后执行。
// 		但在async函数闭包外，不会等await得到结果就会往下执行，因此在async函数闭包外不能拿到await操作的结果。
// 		*/
// 		let s = await my_sql.ROW(sql,params);
// 		console.log(s)
// 	})()		
// 	res.json({uid:1,uname:'张三'})
// 	res.end()	
// })

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))