const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')
const imgUploader = require('../module/imgUploader.js') //自定义图片上传中间件，用于把图片保存到服务器，然后数据域放到req中交给下一个中间件处理
const fs=require('fs')
const path=require('path')

router.post('/retrieve',(req,res)=>{
	console.log('req.body===> ',req.body)
	let publisher_uid = req.body.publisher_uid
	let title = req.body.title
	let start_time = req.body.start_time
	let end_time = req.body.end_time
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
	if(publisher_uid){
		sql+=` and publisher_uid = ?`
		params.push(publisher_uid)
	}
	if(start_time&&start_time.trim(' ').length>0){
		sql+=` and publish_time >= ?`
		params.push(start_time.trim(' '))
	}
	if(end_time&&end_time.trim(' ').length>0){
		sql+=` and publish_time <= ?`
		params.push(end_time.trim(' '))
	}
	
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
		console.log('检索结果原始数据')		
		console.log(trustList)
		
		trustList.forEach((trust,index)=>{
			trust.imglist = trust.imglist.replace(/^,+|,+$/gi,'').split(',')
			trust.edu_service = trust.edu_service.replace(/^,+|,+$/gi,'').split(',')
			trust.food_service = trust.food_service.replace(/^,+|,+$/gi,'').split(',')
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

router.post('/update',(req,res)=>{
	console.log('收到更新请求')
	console.log(req.body)	
	
	
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
	let trustid = req.body.trustid
	// let imglist = ''
	// req.files.forEach((file,index)=>{
	// 	imglist += (index===0?'':',') + '/public/upload/'+ publisher_uid+'/'+file.filename
	// })
		
	;(async()=>{
		sql = `UPDATE trust 
		       SET publish_time=?,trust_title=?,price_monthly=?,min_age=?,max_age=?,
			   trust_detail=?,trust_address=?,edu_service=?,food_service=?
		       WHERE trustid = ?`		
		params = [publish_time,trust_title,price_monthly,min_age,max_age,trust_detail,trust_address,edu_service,food_service,trustid]
		
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){			
			res.json(
			{
				meta:{code: 200,msg:'更新成功'},
				data:{}
			})
			return
		}else{
			res.json(
			{
				meta:{code: 201,msg:'服务器异常，更新失败'},
				data:{}
			})
			return
		}
	})();	
})
 
router.post('/delete',(req,res)=>{
	console.log('req.body===> ',req.body)
	
	let trustid = req.body.trustid
	let publisher_uid = req.body.uid
	if(!trustid || !publisher_uid){
		res.json(
		{
			meta:{code: 201,msg:'参数错误'},
			data:{}
		})
		return
	}
	
	let sql = ''
	let params = [trustid,publisher_uid]
	
	;(async ()=>{
		//先查询出图片列表，当数据库中删除掉该条数据后才从文件夹删除图片文件
		sql = 'select imglist from trust where trustid=? and publisher_uid=?'
		let trustlist = await my_sql.ROW(sql ,params )
		console.log(trustlist[0].imglist)
		let imglist = trustlist[0].imglist.trim(',').split(',')
		
		//从数据库进行删除操作
		sql = "delete from trust where trustid=? and publisher_uid=?"
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		
		if(r.affectedRows>0){			
			res.json(
			{
				meta:{code: 200,msg:'删除成功'},
				data:{}
			})
			//数据库该条数据删除成功后，再删除图片文件
			imglist.forEach(imgUrl=>{				
				fs.unlink(path.join(__dirname,'../',imgUrl),function(error){
				    if(error){
				        console.log(error);
				        return false;
				    }
				    console.log('删除文件'+imgUrl+'成功');
				})	
			})													
			return
		}else{
			res.json(
			{
				meta:{code: 202,msg:'服务器异常，删除失败'},
				data:{}
			})
			return
		}		
	})()
	
	
	
})



module.exports = router;