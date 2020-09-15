const app = require('express');
const router = app.Router();
const my_sql = require('../module/my_sql.js')
 
/*查询求租需求*/
router.post('/retrieve',(req,res)=>{
	console.log('req.body===> ',req.body)
	let publisher_uid = req.body.publisher_uid
	let title = req.body.title
	let min_price = req.body.min_price
	let max_price = req.body.max_price
	let min_size = req.body.min_size
	let max_size = req.body.max_size
	let start_time = req.body.start_time
	let end_time = req.body.end_time
	let address = req.body.address
	let pageNumber = req.body.pageNumber
	let pageSize = req.body.pageSize	
	pageNumber = parseInt(pageNumber)>0?parseInt(pageNumber):1
	pageSize = parseInt(pageSize)>0?parseInt(pageSize):10
		
	let sql = `select demandid,demand_title,publisher_uid,date_format(publish_time,'%Y-%m-%d  %H:%i:%s') as publish_time,price_monthly,area,layout,demand_detail,demand_address,username as publisher_username,phone as publisher_phone
	from demand t1 LEFT OUTER JOIN user t2 ON(t1.publisher_uid = t2.uid) where true`
	
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
	if(min_size&&min_size.trim(' ').length>0){
		sql+=` and area >= ?`
		params.push(parseFloat(min_size.trim(' ')))
	}
	if(max_size&&max_size.trim(' ').length>0){
		sql+=` and area <= ?`
		params.push(parseFloat(max_size.trim(' ')))
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
		return
	})()
})

/*添加求租需求*/
router.post('/add',(req,res)=>{
	console.log('req.body===> ',req.body)
	let demand_title = req.body.demand_title
	let demand_address = req.body.demand_address
	let publisher_uid = req.body.publisher_uid
	let price_monthly = req.body.price_monthly
	let demand_detail = req.body.demand_detail
	let area = req.body.area
	let layout = req.body.layout
	let publish_time = new Date().toLocaleString('chinese', { hour12: false })
	
	;(async ()=>{
		let sql = 'INSERT INTO demand SET ?'
		let params = {demand_title,demand_address,publisher_uid,price_monthly,demand_detail,area,layout,publish_time}			
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){
			params.uid = r.insertId
			res.json(
			{
				meta:{code: 200,msg:'添加求租信息成功'},
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

/*更新求租信息*/
router.post('/update',(req,res)=>{ //更新发布的房源信息，暂不支持修改图片
	console.log('收到更新请求')	
	console.log(req.body)	
	
	
	let demand_title = req.body.demand_title
	let demand_address = req.body.demand_address
	let publisher_uid = req.body.publisher_uid
	let price_monthly = req.body.price_monthly
	let demand_detail = req.body.demand_detail
	let area = req.body.area
	let layout = req.body.layout
	let publish_time = new Date().toLocaleString('chinese', { hour12: false })
	let demandid = req.body.demandid
		
	;(async()=>{
		sql = `UPDATE demand 
			   SET demand_title=?,demand_address=?,price_monthly=?,demand_detail=?,area=?,layout=?,publish_time=?
			   WHERE demandid = ?`	
		params = [demand_title,demand_address,price_monthly,demand_detail,area,layout,publish_time,demandid]
		
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

/*删除求租信息*/
router.post('/delete',(req,res)=>{	
	console.log('req.body===> ',req.body)
	
	let demandid = req.body.demandid
	let publisher_uid = req.body.uid
	
	if(!demandid || !publisher_uid){
		res.json(
		{
			meta:{code: 201,msg:'参数错误'},
			data:{}
		})
		return
	}
	
	let sql = ''
	let params = [demandid,publisher_uid]
	
	;(async ()=>{		
		//从数据库进行删除操作
		sql = "delete from demand where demandid=? and publisher_uid=?"
		let r = await my_sql.EXECUTE(sql,params)
		console.log(JSON.stringify(r))
		if(r.affectedRows>0){
			params.uid = r.insertId
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