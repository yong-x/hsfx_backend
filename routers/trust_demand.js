const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')

/*查询托管需求*/
router.post('/retrieve',(req,res)=>{
	console.log('req.body===> ',req.body)
	
	let publisher_uid = req.body.publisher_uid
	let title = req.body.title
	let foodCondition = req.body.foodCondition
	let min_price = req.body.min_price
	let max_price = req.body.max_price
	let start_time = req.body.start_time
	let end_time = req.body.end_time
	
	let address = req.body.address
	
	let pageNumber = req.body.pageNumber
	let pageSize = req.body.pageSize	
	pageNumber = parseInt(pageNumber)>0?parseInt(pageNumber):1
	pageSize = parseInt(pageSize)>0?parseInt(pageSize):10
	
	let sql = `select trustdemandid,trustdemand_title,trustdemand_address,trustdemand_time,publisher_uid,
	date_format(publish_time,'%Y-%m-%d  %H:%i:%s') as publish_time,edu_service,food_service,price_monthly,childage,trustdemand_detail,username as publisher_username,phone as publisher_phone
	from trustdemand t1 LEFT OUTER JOIN user t2 ON(t1.publisher_uid = t2.uid) where true`
	
	let params = []
	if(publisher_uid){
		sql+=` and publisher_uid = ?`
		params.push(publisher_uid)
	}
	if(min_price&&min_price.trim(' ').length>0){
		sql+=` and price_monthly >= ?`
		params.push(parseFloat(min_price.trim(' ')) )
	}
	if(max_price&&max_price.trim(' ').length>0){
		sql+=` and price_monthly <= ?`
		params.push(parseFloat( max_price.trim(' ')))
	}
	////时间区间选项
	if(start_time&&start_time.trim(' ').length>0){
		sql+=` and publish_time >= ?`
		params.push(start_time.trim(' '))
	}
	if(end_time&&end_time.trim(' ').length>0){
		sql+=` and publish_time <= ?`
		params.push(end_time.trim(' '))
	}
	
	
	if(title&&title.trim(' ').length>0){
		sql+=` and trustdemand_title like '%`+title.trim(' ')+`%'`		
	}
	if(address&&address.trim(' ').length>0){
		sql+=` and trustdemand_address like '%`+address.trim(' ')+`%'`		
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
		let trustdemandList = await my_sql.ROW(sql ,params )
		console.log('检索结果原始数据')		
		console.log(trustdemandList)		
		
		
		
		trustdemandList.forEach((trustdemand,index)=>{
			trustdemand.edu_service = trustdemand.edu_service.trim(',').split(',')
			trustdemand.food_service = trustdemand.food_service.trim(',').split(',')
		})
		
		console.log('结果加工后数据')
		console.log(trustdemandList)
		
		res.json(
		{
			meta:{code: 200,msg:'检索成功'},
			data:{trustdemandList:trustdemandList}
		})							
		res.end()
		return
	})()
	
	
	
	
	
	
})

/*添加托管需求*/
router.post('/add',(req,res)=>{
	console.log('req.body===> ',req.body)
	let publisher_uid = req.body.publisher_uid
	let trustdemand_title = req.body.trustdemand_title
	let childage = req.body.childage
	let price_monthly = req.body.price_monthly
	let trustdemand_time = req.body.trustdemand_time
	let trustdemand_address = req.body.trustdemand_address
	let edu_service = req.body.edu_service						
	let food_service = req.body.food_service
	let trustdemand_detail = req.body.trustdemand_detail
	let publish_time = new Date().toLocaleString('chinese', { hour12: false })
	
	;(async ()=>{
		let sql = 'INSERT INTO trustdemand SET ?'
		let params = {publisher_uid,trustdemand_title,childage,price_monthly,trustdemand_time,trustdemand_address,edu_service,food_service,trustdemand_detail,publish_time}
				
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){
			params.uid = r.insertId
			res.json(
			{
				meta:{code: 200,msg:'添加托管需求信息成功'},
				data:{}
			})
			return
		}else{
			res.json(
			{
				meta:{code: 201,msg:'服务器异常，添加失败'},
				data:{}
			})
			return
		}		
	})()
	
})

/*更新托管需求*/
router.post('/update',(req,res)=>{
	console.log('收到更新请求')
	console.log('req.body===> ',req.body)
	let publisher_uid = req.body.publisher_uid
	let trustdemand_title = req.body.trustdemand_title
	let childage = req.body.childage
	let price_monthly = req.body.price_monthly
	let trustdemand_time = req.body.trustdemand_time
	let trustdemand_address = req.body.trustdemand_address
	let edu_service = req.body.edu_service						
	let food_service = req.body.food_service
	let trustdemand_detail = req.body.trustdemand_detail
	let publish_time = new Date().toLocaleString('chinese', { hour12: false })
	let trustdemandid = req.body.trustdemandid
	
	;(async()=>{
		sql = `UPDATE trustdemand 
			   SET trustdemand_title=?,childage=?,price_monthly=?,trustdemand_time=?,trustdemand_address=?,edu_service=?,food_service=?,trustdemand_detail=?,publish_time=?
			   WHERE trustdemandid = ?`	
		params = [trustdemand_title,childage,price_monthly,trustdemand_time,trustdemand_address,edu_service,food_service,trustdemand_detail,publish_time,trustdemandid]
		
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

/*删除托管需求*/
router.post('/delete',(req,res)=>{
	console.log('req.body===> ',req.body)
	
	let trustdemandid = req.body.trustdemandid
	let publisher_uid = req.body.uid
	
	if(!trustdemandid || !publisher_uid){
		res.json(
		{
			meta:{code: 201,msg:'参数错误'},
			data:{}
		})
		return
	}
	
	let sql = ''
	let params = [trustdemandid,publisher_uid]
	
	;(async ()=>{		
		//从数据库进行删除操作
		sql = "delete from trustdemand where trustdemandid=? and publisher_uid=?"
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){			
			res.json(
			{
				meta:{code: 200,msg:'删除成功'},
				data:{}
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