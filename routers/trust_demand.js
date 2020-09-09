const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')

/*查询托管需求*/
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
	
	let sql = `select trustdemandid,trustdemand_title,trustdemand_address,trustdemand_time,publisher_uid,
	date_format(publish_time,'%Y-%m-%d  %H:%i:%s') as publish_time,edu_service,food_service,price_monthly,childage,trustdemand_detail,username as publisher_username,phone as publisher_phone
	from trustdemand t1 LEFT OUTER JOIN user t2 ON(t1.publisher_uid = t2.uid) where true`
	
	let params = []
	if(min_price&&min_price.trim(' ').length>0){
		sql+=` and price_monthly >= ?`
		params.push(parseFloat(min_price.trim(' ')) )
	}
	if(max_price&&max_price.trim(' ').length>0){
		sql+=` and price_monthly <= ?`
		params.push(parseFloat( max_price.trim(' ')))
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







module.exports = router;