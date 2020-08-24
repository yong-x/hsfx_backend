const app = require('express');
const router = app.Router();

 
var str = '';
router.get('/',(req,res)=>{
    res.json({name:'mian主路由'})
})

 
module.exports = router;