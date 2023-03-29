var express = require('express');

var dbAPI = require('../DBAPI/db.js');
var router = express.Router();

var userMethods = require('../APILibrary/userAPI');

var client = dbAPI.client;

/* GET users default */
router.get('/', function(req, res, next) {
  res.send('Hello World User');
});


/* GET users email check */
router.get('/email', async function(req, res, next) {
  const email = req.body;
  
  try{
    let found = await userMethods.verifyEmail(client, email);
    
    res.json(found);
  }
  catch(err){
    res.status(400).json({message: err.message});
  }
  


});
/* GET users password check */
router.get('/password', async function(req, res, next) {
  const password = req.body;
  
  try{
    let user = await userMethods.verifyPass(client, password);
    req.session.isAuth = true;
    res.json(user);
  }
  catch(err){
    res.status(400).json({message: err.message});
  }


});

/* GET confirmation if local user / browser is authenticated with valid session */
router.get('/isAuthenticated', async function(req, res, next){
  try{

    if(req.session.isAuth === true) {
      res.json({"isAuth": true})
      
    }
    else{
      res.json({"isAuth": false})
    }
  
    
  }
  catch(err){
    res.status(400).json({message: err.message});
  }
  
})

/* GET users logout*/
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

/* POST create user */
router.post('/adduser', async function(req, res, next) {
  
 const userData = req.body;
  
  try{
    let user = await userMethods.addUser(client, userData);
    req.session.isAuth = true;
    res.json(user);
  }
  catch(err){
    res.status(400).json({message: err.message});
  }
  
});

module.exports = router;
