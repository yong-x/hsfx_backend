'use strict';
const mysql  = require( 'mysql' );
// 封装mysql常见数据库操作，方便外部模块调用
var pool  = mysql.createPool( {
    connectionLimit : 50,
    host            : '127.0.0.1',
    user            : 'xy',
    password    : 'xy123456',
    database     : 'hsfx_houserent',
    multipleStatements : true  //是否允许执行多条sql语句
} );
//将结果封装为对象数组返回
var row=( sql , params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
           let query =  connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve(res);
            });
			console.log('当前执行=>')
			console.error(query.sql);
        });
    });
};

//将结果封装为一个对象返回，如果有多个对象只返回第一个
var first=( sql , params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            let query =connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve( res[0] || null );
            });
			console.log('当前执行=>')
			console.error(query.sql);
        });
    });
};
//以原始形式返回单个查询结果
var single=(sql , params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            let query =connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject( error );
                    return;
                }
                for( let i in res[0] )
                {
                    resolve( res[0][i] || null );
                    return;
                }
                resolve(null);
            });
			console.log('当前执行=>')
			console.error(query.sql);
        });
    });
}
//执行代码，以原始形式返回执行结果
var execute=(sql , params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            let query =connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve( res );
            });
			console.error('当前执行=>')
			console.error(query.sql);
        });
    });
}

//模块导出
module.exports = {
    ROW     : row ,
    FIRST   : first ,
    SINGLE  : single ,
    EXECUTE : execute
}