var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var pathLib = require('path');
var mgdb = require('../../utils/mgdb');
var fs = require('fs');

router.post('/', function(req, res, next) {
  //抓取用户信息(name,pass,icon,nikename)
  let {username,password,nikename,icon} = req.body;
  // console.log('reg',username,password,nikename,icon)

  //校验必传参数
  if(!username || !password){
    res.send({err:1,msg:'username,password为必传参数'});
    return;
  }

  //注册时间生成服务器时间  关注粉丝设0
  let follow = 0;
  let fans = 0;
  let time = Date.now();//生成注册时间

  //密码加盐
  password = bcrypt.hashSync(password, 10); 
  nikename = nikename || '系统给的'; //借助第三方昵称生成库

  //icon 借助multer  -》 icon 使用用户传递或者默认icon
  if(req.files && req.files.length>0 ){

    //改名 整合路径 存到 icon
    fs.renameSync(
      req.files[0].path,
      req.files[0].path + pathLib.parse(req.files[0].originalname).ext
    )
    icon = '/upload/user/' + req.files[0].filename + pathLib.parse(req.files[0].originalname).ext
  }else{
    icon = '/upload/noimage.png';
  }

  //写库->mgdb->find 用户名 -> 存库前密码加密-》返回结果
  console.log(0,username,password,nikename,icon,time)
  
  mgdb({

    collectionName: 'user',
    success:({collection,client})=>{
      collection.find({
        username
      },{
  
      }).toArray((err,result)=>{
        console.log(1);
        if(!err){
          console.log(3);
          if(result.length>0){
            //不通过 返回错误信息
            res.send({err:1,msg:'用户名已存在'})
            // fs.unlink('./public'+icon,(err)=>{})
            if(icon.indexOf('noimage') === -1){
              fs.unlinkSync('./public'+icon)
            }
            
            client.close()
  
          }else{
            //通过   返回用户数据  插入库 返回插入后的数据
            collection.insertOne({
              username,password,nikename,follow,fans,time,icon
            },(err,result)=>{
              if(!err){
                // req.session[key]=result.insertedId
                delete result.ops[0].password
                res.send({err:0,msg:'注册成功',data:result.ops[0]})
              }else{
                res.send({err:1,msg:'user集合操作失败'})
                client.close()
              }
            })
          }
        }else{
          console.log(2);
          res.send({err:1,msg:'user集合操作失败'})
          client.close()
        }
      })
    }
  })

});

module.exports = router;
