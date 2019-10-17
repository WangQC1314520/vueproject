let express = require('express')
let router = express.Router()
let https = require('https');

router.get('/', (req, res, next) => {
  
  let {start,count} = req.query;
  start = start || 1;
  count = count || 5;
  
  let options={
    hostname:'douban.uieee.com',
    port:443,
    path:`/v2/movie/top250?start=${req.query.start}&count=${req.query.count}`,
    method:'GET'
  };

  // let reqHttp = https.request({配置},(resHttp)=>{
  let reqHttp = https.request(options, (resHttp) => {
    let str = '';
    resHttp.on('data', (chunk) => { str += chunk })
    resHttp.on('end', () => {
      // console.log(JSON.parse(str))
      res.send(JSON.parse(str))
    })

  })


  //reqHttp 请求对象
  reqHttp.on('error', (err) => { console.log(err) });	//监听请求失败信息
  reqHttp.end();//一定 主动请求结束


})

module.exports = router;