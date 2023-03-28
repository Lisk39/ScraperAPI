var express = require('express');

var dbAPI = require('../DBAPI/db.js');
var router = express.Router();

var userMethods = require('../APILibrary/userAPI');

var client = dbAPI.client;

/* GET users email check */
router.get('/', function(req, res, next) {
  res.send('Hello World');
});


/* GET users email check */
router.get('/email', async function(req, res, next) {
  const email = req.body;
  
  try{
    let user = await userMethods.verifyEmail(client, email);
    
    res.json(user);
  }
  catch(err){
    res.status(400).json({message: err.message});
  }
  


});
/* GET users email check */
router.get('/password', async function(req, res, next) {
  const email = req.body;
  
  try{
    let user = await userMethods.verifyPass(client, email);
    req.session.isAuth = true;
    res.json(user);
  }
  catch(err){
    res.status(400).json({message: err.message});
  }
  


});
router.get('/logout', async function(req, res, next) {
  
  
  
  req.session.destroy((err) => {
  if(err)
  {
    throw err;
  }
  var mess = new Object();
  mess.logout = true;
  res.json(mess);


})
  


});

module.exports = router;
