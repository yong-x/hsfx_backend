const app = require('express');
const router = app.Router();

 

router.get('/adduser',(req,res)=>{
    res.json({name:'user子路由'})
})


module.exports = router;