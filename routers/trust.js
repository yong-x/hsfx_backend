const app = require('express');
const router = app.Router();

 

router.get('/addtrust',(req,res)=>{
    res.json({name:'trust子路由'})
})


module.exports = router;