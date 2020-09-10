const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')
 

router.post('/login',(req,res)=>{
	let phone = req.body.phone
	let password = req.body.password
	console.log(phone)
	console.log(password);
	
	(async ()=>{
		let sql = 'select uid,phone,username,password from user where phone = ?'
		let params = [phone]
		/*
		await保证在async函数闭包内，await代码之后的代码不会异步执行，必须等到await操作得到结果才会继续往后执行。
		但在async函数闭包外，不会等await得到结果就会往下执行，因此在async函数闭包外不能拿到await操作的结果。
		*/
		let user = await my_sql.FIRST(sql,params)
		
		console.log(user)
		if(!user){
			res.json(
			{
				meta:{code: 201,msg:'该用户不存在'},
				data:{}
			})
		}else if(user.password != password){
			res.json(
			{
				meta:{code: 202,msg:'密码错误'},
				data:{}
			})
		}else {
			res.json(
			{
				meta:{code: 200,msg:'登录成功'},
				data:{user:user}
			})
		}
		res.end()
	})()			
})

router.post('/register',(req,res)=>{
	let phone = req.body.phone
	let username = req.body.username
	let password = req.body.password
	
	;(async ()=>{
		let sql = 'select uid from user where phone = ?'
		let params = [phone]
		/*
		await保证在async函数闭包内，await代码之后的代码不会异步执行，必须等到await操作得到结果才会继续往后执行。
		但在async函数闭包外，不会等await得到结果就会往下执行，因此在async函数闭包外不能拿到await操作的结果。
		*/
		let user = await my_sql.FIRST(sql,params)
		if(user){
			res.json(
			{
				meta:{code: 201,msg:'该用户已经注册'},
				data:{}
			})
			return
		}
		
		
		sql = 'INSERT INTO user SET ?';
		let account_state = '0'; //默认用户状态
		params = {phone,username,password,account_state}
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){
			params.uid = r.insertId
			res.json(
			{
				meta:{code: 200,msg:'注册成功,立即登录'},
				data:{user: params}
			})
			return
		}else{
			res.json(
			{
				meta:{code: 202,msg:'服务器异常，注册失败'},
				data:{user: params}
			})
			return
		}	
	})()
	
	
	
	
})

router.post('/update',(req,res)=>{
	
	let uid = req.body.uid
	let phone = req.body.phone
	let username = req.body.username
	let password = req.body.password
	
	;(async ()=>{
		let sql=''
		let params =[]
		
		if(phone&&phone.trim(' ').length===11){ //用户要更新手机号，需要进行唯一性查询检测
			sql = 'select uid from user where phone = ?'
			params = [phone]		
			let user = await my_sql.FIRST(sql,params)
			if(user && user.uid != uid ){
				res.json(
				{
					meta:{code: 201,msg:'该手机号已经被他人注册'},
					data:{}
				})
				return
			}
		}
		
		sql = 'update user set uid =?'
		params = [uid]
		if(username && username.trim(' ').length>0){
			sql+=',username=?'
			params.push(username.trim(' '))
		}
		if(phone && phone.trim(' ').length===11){
			sql+=',phone=?'
			params.push(phone.trim(' '))
		}
		if(password && password.trim(' ').length>0){
			sql+=',password=?'
			params.push(password.trim(' '))
		}
		sql+=' where uid = ?'
		params.push(uid)
		
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){
			params.uid = r.insertId
			res.json(
			{
				meta:{code: 200,msg:'更新用户成功'},
				data:{user: params}
			})
			return
		}else{
			res.json(
			{
				meta:{code: 202,msg:'服务器异常，更新失败'},
				data:{user: params}
			})
			return
		}
		
		
		
	})()
	
	
})


router.get('/adduser',(req,res)=>{
    res.json({name:'user子路由'})
})


module.exports = router;