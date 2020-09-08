const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')
 

router.post('/retrieve',(req,res)=>{
	console.log('req.body===> ',req.body)
	let title = req.body.title
	let min_price = req.body.min_price
	let max_price = req.body.max_price
	let min_size = req.body.min_size
	let max_size = req.body.max_size
	let address = req.body.address
	let pageNumber = req.body.pageNumber
	let pageSize = req.body.pageSize	
	pageNumber = parseInt(pageNumber)>0?parseInt(pageNumber):1
	pageSize = parseInt(pageSize)>0?parseInt(pageSize):5
		
	let sql = `select demandid,demand_title,publisher_uid,date_format(publish_time,'%Y-%m-%d  %H:%i:%s') as publish_time,price_monthly,area,layout,demand_detail,demand_address,username as publisher_username,phone as publisher_phone
	from demand t1 LEFT OUTER JOIN user t2 ON(t1.publisher_uid = t2.uid) where true`
	
	let params = []
	if(min_price&&min_price.trim(' ').length>0){
		sql+=` and price_monthly >= ?`
		params.push(min_price.trim(' '))
	}
	if(max_price&&max_price.trim(' ').length>0){
		sql+=` and price_monthly <= ?`
		params.push(max_price.trim(' '))
	}
	if(min_size&&min_size.trim(' ').length>0){
		sql+=` and area >= ?`
		params.push(min_size.trim(' '))
	}
	if(max_size&&max_size.trim(' ').length>0){
		sql+=` and area <= ?`
		params.push(max_size.trim(' '))
	}	
	if(title&&title.trim(' ').length>0){
		sql+=` and demand_title like '%`+title.trim(' ')+`%'`		
	}
	if(address&&address.trim(' ').length>0){
		sql+=` and demand_address like '%`+address.trim(' ')+`%'`		
	}
	
	let startOffset = pageSize*(pageNumber-1)
	sql+=` order by publish_time desc LIMIT ?,?`
	params.push(startOffset,pageSize)
	console.log('拼接后sql语句')
	console.log(sql)
	;(async ()=>{
		let demandList = await my_sql.ROW(sql ,params )
		console.log('检索结果原始数据')		
		console.log(demandList)		
		res.json(
		{
			meta:{code: 200,msg:'检索成功'},
			data:{demandList:demandList}
		})							
		res.end()
		
	})()
})




module.exports = router;