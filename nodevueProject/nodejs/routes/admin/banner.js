let express = require('express');
let router = express.Router();
let mgdb = require('../../utils/mgdb');
let pathLib = require('path')
let fs = require('fs');

//添加 
router.post('/', (req, res, next) => {
  
  let { content, title, sub_title, auth } = req.body;//拆除body数据
  let time = Date.now();//创建服务器上传时间
  
   //multer多图片循环，找到
  let icon, banner;
  
  req.files && req.files.forEach((file, index) => {
    //抓取到对应图片
    if (file.fieldname === 'icon') {
      icon = '/upload/user/' + file.filename + pathLib.parse(file.originalname).ext;
    }
    if (file.fieldname === 'banner') {
      banner = '/upload/banner/' + file.filename + pathLib.parse(file.originalname).ext;
    }
    // console.log('a',icon,banner)
    fs.renameSync(//本地图片命名
      file.path,
      file.path + pathLib.parse(file.originalname).ext
    )
  })



  //未传图片处理
  if (!banner) banner = '/upload/noimage.png';
  if (!icon) icon = '/upload/noimage.png';

  // console.log('b',banner,icon)

  mgdb(
    {
      collectionName: 'banner',
      success:({collection, client}) => {
        collection.insertOne(
          { title, sub_title, banner, time, detail: { icon, auth, content } }
          ,
          (err, result) => {
            if (!err && result.result.ok) {
              // res.send({ error: 0, mess: '成功', data:  result.result.ops[0] })
              res.send({ err: 0, msg: '成功', data: { _id: result.insertedId, title, sub_title, banner, time, detail: { icon, auth, content } } })
            } else {
              res.send({ err: 1, msg: '添加失败' })
            }
            client.close();
          }
        )
      }
    }
    
  );
})

//删 
router.delete('/:id', (req, res, next) => {

  let id = req.params.id;
  if (!id) {
    res.send({ err: 1, msg: 'id为必传参数' });
    return;
  }

  mgdb({
    collectionName: 'banner',
    success:({collection, client, ObjectID}) => {
      collection.deleteOne({
        _id: ObjectID(id)
      },((err, result) => {
        // console.log(result);// 添加条件 > 0
        if(result.result.n>0){
          res.send({err:0,msg:'删除成功'})
          // res.render('xxx.ejs',{数据})
        }else{
          res.send({err:1,msg:'删除失败'})
        }
        client.close();//关闭连接
      }))
    }
  })
})

//改
router.patch('/:id', (req, res, next) => {
  let id = req.params.id;

  if (!id) {
    res.send({ err: 1, msg: 'id为必传参数' })
    return;
  }

  mgdb({
    collectionName: 'banner',
    success:( {collection, client, ObjectID} ) => {
      collection.find({
        _id: ObjectID(id)
      }, {
          projection: { _id: 0 }//显示的key 
        }).toArray((err, result) => {
  
          // result[0] = 库数据
  
          //传过来的数据 和 库数据  合并
          let {title,sub_title,auth,content} = req.body;
          title = title || result[0].title;
          sub_title = sub_title || result[0].sub_title;
          auth = auth || result[0].auth;
          content = content || result[0].content;
  
  
          //multer多图片循环，找到
          let icon, banner;
          req.files && req.files.forEach((file, index) => {
            //抓取到对应图片
            if (file.fieldname === 'icon') {
              icon = '/upload/banner/' + file.filename + pathLib.parse(file.originalname).ext;
            }
            if (file.fieldname === 'banner') {
              banner = '/upload/banner/' + file.filename + pathLib.parse(file.originalname).ext;
            }
            fs.renameSync(//本地图片命名
              file.path,
              file.path + pathLib.parse(file.originalname).ext
            )
          })
  
          icon = icon || result[0].detail.icon;
          banner = banner || result[0].banner;
          let time = Date.now();
  
  
          mgdb({
            collectionName: 'banner',
            success:( {collection, client, ObjectID} ) => {
              collection.updateMany({
                _id: ObjectID(id)
              },{
                $set:{
                  title,sub_title,banner,time,detail:{icon,auth,content}
                }
              },{
                upsert:false, //插入
                projection:false //全局替换
              },((err, result) => {
                // console.log(result.result.n);//成功条件 > 0
                // console.log(result.modifiedCount);// 修改的条数
    
                if(result.result.n>0){
                  res.send({err:0,msg:'修改成功'})// + 返回改后的数据
                  // req.render('xx.ejs',{数据})
                }else{
                  res.send({err:1,msg:'修改失败'})  
                }
                client.close();//关闭连接
              }))
            }
          })
          
        })
    }
  })
})

module.exports = router;