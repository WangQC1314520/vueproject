var express = require('express');
var router = express.Router();

router.delete('/', function(req, res, next) {
  req.session['1907_session'] = undefined;
  res.send({err:0,msg:'注销成功'})
});

module.exports = router;
