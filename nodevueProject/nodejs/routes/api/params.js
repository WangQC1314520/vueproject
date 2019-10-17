module.exports = (req,res,next) => {
  //授权业务

  //整理公共参数
  req.query._page = req.query._page ? req.query._page-1 : require('../../config/params')._page - 0;
  req.query._limit = req.query._limit ? req.query._limit-0 : require('../../config/params')._limit - 0;
  req.query.q = req.query.q ? req.query.q : require('../../config/params').q;
  req.query._sort = req.query._sort ? req.query._sort : require('../../config/params')._sort;

  
  req.body._page = req.body._page ? req.body._page-1 : require('../../config/params')._page - 0;
  req.body._limit = req.body._limit ? req.body._limit-0 : require('../../config/params')._limit - 0;
  req.body.q = req.body.q ? req.body.q : require('../../config/params').q;
  req.body._sort = req.body._sort ? req.body._sort : require('../../config/params')._sort;

  // console.log('all params query',typeof req.query._page)
  // console.log('all params body',typeof req.body._page)

  //处理动态的api名
  // console.log('all',req.params)
  // req.rootParams = req.params[0].split('/')[0]


  next();
}