
/*var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Hello World!');
    res.end();
}).listen(8080);*/

var dbAPI = require('./DBAPI/db.js');

var gateway = require('./APILibrary/gateway');

var express = require('express');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const fs = require('fs');
var path = require("path");
require('dotenv').config();




var app = express();




let ScraperDataRaw = fs.readFileSync((path.resolve('./TestData', 'ratingstest2.json')));
let Userdataraw = fs.readFileSync((path.resolve('./TestData', 'TestUser2.json')));
let itemdataRaw = fs.readFileSync((path.resolve('./TestData', 'iteminfo.json')));
let loginRaw = fs.readFileSync((path.resolve('./TestData', 'login.json')));
let scraperdata = JSON.parse(ScraperDataRaw);
let userdata = JSON.parse(Userdataraw);
let itemdata = JSON.parse(itemdataRaw);
let loginData = JSON.parse(loginRaw);

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */

    

    const Mongouri = dbAPI.url;

    //var client = dbAPI.client;
   

   
    
   
    try {
        
        




        
        const store = new MongoDBSession({
            uri: Mongouri,
            databaseName: 'Sessions',
            collection: "Sessions",

        });
    
        app.use(session(
            {
                secret: 'key that will sign cookie',
                resave: false,
                saveUninitialized: false,
                store: store,
            }
            ));



        app.use(express.json())

        // setup products endpoint/route
        const userRouter = require('./routes/users')
        app.use('/users', userRouter)

        app.listen(8080);
        console.log("listening on port 8080");
        // Make the appropriate DB calls
        //await gateway.list(client);
        

        //await gateway.addDataScrap(client, scraperdata);
        
        //await gateway.addUser(client, userdata);
        //await gateway.likeItem(client, userdata, itemdata);
        //await gateway.dislikeItem(client, userdata, itemdata);
        //let testGuy = await gateway.verifyEmail(client, loginData);

        

        //let testData = await gateway.getData(client);
/*
        app.get('/', function (req, res) {
       
            //console.log(req.session);
            //req.session.isAuth = true;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(testGuy, null, 3));
            
        });
        
*/
    } catch (e) {
        console.error(e);
    } 
    
    /*finally {
        dbAPI.close();
    }*/
    
}

main().catch(console.error);