const app = require('express');
const router = app.Router();

 

router.get('/addhouse',(req,res)=>{
    res.json({name:'house子路由'})
})


module.exports = router;