const app = require('express');
const router = app.Router();

 

router.get('/adddemand',(req,res)=>{
    res.json({name:'demand子路由'})
})


module.exports = router;