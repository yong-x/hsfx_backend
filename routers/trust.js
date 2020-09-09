const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')
const imgUploader = require('../module/imgUploader.js') //自定义图片上传中间件，用于把图片保存到服务器，然后数据域放到req中交给下一个中间件处理

router.post('/retrieve',(req,res)=>{
	console.log('req.body===> ',req.body)
	let title = req.body.title
	let foodCondition = req.body.foodCondition
	let min_price = req.body.min_price
	let max_price = req.body.max_price
	let address = req.body.address	
	let pageNumber = req.body.pageNumber
	let pageSize = req.body.pageSize
	pageNumber = parseInt(pageNumber)>0?parseInt(pageNumber):1
	pageSize = parseInt(pageSize)>0?parseInt(pageSize):10
	
		
	let sql = `select trustid,trust_title,trust_address,publisher_uid,date_format(publish_time,'%Y-%m-%d  %H:%i:%s') as publish_time,min_age,max_age,edu_service,food_service,price_monthly,trust_detail,imglist,username as publisher_username,phone as publisher_phone
	from trust t1 LEFT OUTER JOIN user t2 ON(t1.publisher_uid = t2.uid) where true`
	
	let params = []
	
	if(min_price&&min_price.trim(' ').length>0){
		sql+=` and price_monthly >= ?`
		params.push(parseFloat( min_price.trim(' ')))
	}
	if(max_price&&max_price.trim(' ').length>0){
		sql+=` and price_monthly <= ?`
		params.push(parseFloat(max_price.trim(' ')))
	}
	if(title&&title.trim(' ').length>0){
		sql+=` and trust_title like '%`+title.trim(' ')+`%'`		
	}
	if(address&&address.trim(' ').length>0){
		sql+=` and trust_address like '%`+address.trim(' ')+`%'`		
	}
	if(foodCondition&&foodCondition.length>0){
		foodCondition.forEach((item,index)=>{
			sql+=` and food_service like '%`+item.trim(' ')+`%'`
		})
	}
	let startOffset = pageSize*(pageNumber-1)
	sql+=` order by publish_time desc LIMIT ?,?`
	params.push(startOffset,pageSize)
	console.log('拼接后sql语句')
	console.log(sql)
	
	;(async ()=>{
		let trustList = await my_sql.ROW(sql ,params )
		//console.log('检索结果原始数据')		
		//console.log(trustList)
		
		trustList.forEach((trust,index)=>{
			trust.imglist = trust.imglist.trim(',').split(',')
			trust.edu_service = trust.edu_service.trim(' ').split(' ')
			trust.food_service = trust.food_service.trim(' ').split(' ')
		})
		console.log('检索结果加工后数据')
		console.log(trustList)
		
		res.json(
		{
			meta:{code: 200,msg:'检索成功'},
			data:{trustList:trustList}
		})							
		res.end()
		
		
	})()
	
	
	
})

router.post('/add',imgUploader,(req,res)=>{
	console.log('收到上传请求')
	//随图片一起上传的其它数据放在了req.body中
	console.log(req.body)
	console.log(req.files) //用户上传的图片信息数组
	
	let publisher_uid = req.body.publisher_uid
	let publish_time = new Date().toLocaleString('chinese', { hour12: false });	
	let trust_title = req.body.trust_title
	let price_monthly = req.body.price_monthly
	let min_age = req.body.min_age
	let max_age = req.body.max_age
	let trust_detail = req.body.trust_detail
	let trust_address = req.body.trust_address
	let edu_service = req.body.edu_service
	let food_service = req.body.food_service
	let imglist = ''
	req.files.forEach((file,index)=>{
		imglist += (index===0?'':',') + '/public/upload/'+ publisher_uid+'/'+file.filename
	})
	;(async ()=>{
		sql = 'INSERT INTO trust SET ?';
		params = {publisher_uid,publish_time,trust_title,price_monthly,min_age,max_age,trust_detail,trust_address,edu_service,food_service,imglist}
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
				meta:{code: 201,msg:'服务器异常，上传失败'},
				data:{}
			})
			return
		}
		
		
		
	})()
})

 

router.get('/addtrust',(req,res)=>{
    res.json({name:'trust子路由'})
})


module.exports = router;