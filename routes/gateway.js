var express = require('express');

var dbAPI = require('../DBAPI/db.js');
var router = express.Router();

var gateMethods = require('../APILibrary/gatewayAPI');

var client = dbAPI.client;

/* GET users default */
router.get('/', function(req, res, next) {
  res.send('Hello World Gate');
});


/* GET data from db */
router.get('/getdata', async function(req, res, next) {

    
    try{
      let data = await gateMethods.getData(client);
     
      res.json(data);
    }
    catch(err){
      res.status(400).json({message: err.message});
    }
  
  
  });

/* POST add data from scraper */
router.post('/adddata', async function(req, res, next) {
  
    const data = req.body;
     
     try{
       let confirm = await gateMethods.addDataScrap(client, data);
    
       res.json(confirm);
     }
     catch(err){
       res.status(400).json({message: err.message});
     }
     
   });
/* PATCH item Liked */
/* Jsons user and item need to be collected in to an array in one json which is passed to this API*/
router.patch('/itemliked', async function(req, res, next) {
  
    const user = req.body[0];
    const item = req.body[1];

    let userupdated = await gateMethods.likeItem(client, user , item);
    res.json(userupdated);
     /*
     try{
      
     }
     catch(err){
       res.status(400).json({message: err.message});
     }
     */
   });
/* PATCH item DisLiked */
/* Jsons user and item need to be collected in to an array in one json which is passed to this API*/
router.patch('/itemdisliked', async function(req, res, next) {
  
    const user = req.body[0];
    const item = req.body[1];

    
    let userupdated = await gateMethods.dislikeItem(client, user , item);
    res.json(userupdated);
    /*
     try{
       
     }
     catch(err){
       res.status(400).json({message: err.message});
     }
     */
   });


module.exports = router;