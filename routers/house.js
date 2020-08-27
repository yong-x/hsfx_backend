const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')
const mysql = require('mysql')
const imgUploader = require('../module/imgUploader.js') //自定义图片上传中间件，用于把图片保存到服务器，然后数据域放到req中交给下一个中间件处理
router.post('/retrieve',(req,res)=>{ //按查询条件检索信息
	let tag = req.body.tag
	let min_price = req.body.min_price
	let max_price = req.body.max_price
	let start_time = req.body.start_time
	let end_time = req.body.end_time
	let pageNumber = req.body.pageNumber
	let pageSize = req.body.pageSize
	pageNumber = parseInt(pageNumber)>0?parseInt(pageNumber):1
	pageSize = parseInt(pageSize)>0?parseInt(pageSize):5
	console.log(tag+' + '+ min_price+' + '+max_price+' + '+start_time+' + '+end_time +' + '+pageNumber +' + '+pageSize)
	//let sql = `select houseid,publisher_id,publish_time,price_monthly,house_address,imglist,taglist from house where true`;
	let sql = `select houseid,publisher_id,date_format(publish_time,'%Y-%m-%d  %H:%i:%s') as publish_time,price_monthly,house_detail,house_address,imglist,taglist,username as publisher,phone as publisher_phone 
	from house t1 LEFT OUTER JOIN user t2 ON(t1.publisher_id = t2.uid) where true`
	
	let params = []
	if(min_price&&min_price.trim(' ').length>0){
		sql+=` and price_monthly >= ?`
		params.push(min_price.trim(' '))
	}
	if(max_price&&max_price.trim(' ').length>0){
		sql+=` and price_monthly <= ?`
		params.push(max_price.trim(' '))
	}
	if(start_time&&start_time.trim(' ').length>0){
		sql+=` and publish_time >= ?`
		params.push(start_time.trim(' '))
	}
	if(end_time&&end_time.trim(' ').length>0){
		sql+=` and publish_time <= ?`
		params.push(end_time.trim(' '))
	}
	if(tag&&tag.trim(' ').length>0){
		sql+=` and taglist like '%`+tag.trim(' ')+`%'`
		//params.push(tag.trim(' '))
	}
	let startOffset = pageSize*(pageNumber-1)
	sql+=` order by publish_time desc LIMIT ?,?`
	params.push(startOffset,pageSize)
	console.log('拼接后sql语句')
	console.log(sql)
	
	;(async ()=>{		
		/*
		await保证在async函数闭包内，await代码之后的代码不会异步执行，必须等到await操作得到结果才会继续往后执行。
		但在async函数闭包外，不会等await得到结果就会往下执行，因此在async函数闭包外不能拿到await操作的结果。
		*/
	   let houseList = await my_sql.ROW(sql ,params )
		console.log('检索结果原始数据')		
		console.log(houseList)
		if(houseList && houseList.length > 0){
			houseList.forEach((house,index)=>{
				house.imglist = house.imglist.trim(',').split(',')
				house.taglist = house.taglist.trim(',').split(',')
			})
			console.log('检索结果加工后数据')
			console.log(houseList)	
			
			res.json(
			{
				meta:{code: 200,msg:'检索成功'},
				data:{houseList:houseList}
			})			
		}else{
			res.json(
			{
				meta:{code: 201,msg:'没有检索到数据'},
				data:{houseList:[]}
			})			
		}
		
		res.end()
	})()	
}) 

router.post('/add',imgUploader,(req,res)=>{ //第一个中间件imgUploader保存图片，第二个中间件把数据存入数据库
	console.log('收到上传请求')
	//随图片一起上传的其它数据
	console.log(req.body)
	console.log(req.files) //用户上传的图片信息数组
	let publisher_id = req.body.publisher_uid
	let publish_time = new Date().toLocaleString('chinese', { hour12: false });
	let price_monthly = req.body.price_monthly
	let house_address = req.body.house_address
	let house_detail = req.body.house_detail
	let taglist = req.body.taglist.replace(/\s+/g,',').trim(',')
	let imglist = ''
	req.files.forEach((file,index)=>{
		imglist += (index===0?'':',') + '/public/upload/'+ publisher_id+'/'+file.filename
	})
	;(async()=>{
		sql = 'INSERT INTO house SET ?';
		
		params = {publisher_id,price_monthly,publish_time,house_address,house_detail,imglist,taglist}
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){
			params.uid = r.insertId
			res.json(
			{
				meta:{code: 200,msg:'上传成功'},
				data:{}
			})
			return
		}else{
			res.json(
			{
				meta:{code: 20,msg:'服务器异常，上传失败'},
				data:{}
			})
			return
		}
	})();
	
	
	
	
})


router.get('/addhouse',(req,res)=>{
    res.json({name:'house子路由'})
})


module.exports = router;