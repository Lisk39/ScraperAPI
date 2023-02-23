
/*var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Hello World!');
    res.end();
}).listen(8080);*/

var hello = require('./gateway');

var express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs');
var path = require("path");
require('dotenv').config();




var app = express();


let ScraperDataRaw = fs.readFileSync((path.resolve(__dirname, 'ratingstest2.json')));
let Userdataraw = fs.readFileSync((path.resolve(__dirname, 'TestUser2.json')));
let itemdataRaw = fs.readFileSync((path.resolve(__dirname, 'iteminfo.json')));
let loginRaw = fs.readFileSync((path.resolve(__dirname, 'login.json')));
let scraperdata = JSON.parse(ScraperDataRaw);
let userdata = JSON.parse(Userdataraw);
let itemdata = JSON.parse(itemdataRaw);
let loginData = JSON.parse(loginRaw);

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */

    
    const uri = "mongodb+srv://"+process.env.NAME+":"+process.env.PASS+"@formulafinder.kvaq0zi.mongodb.net/?retryWrites=true&w=majority";


    const client = new MongoClient(uri);

    

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        //await hello.list(client);
        
        //await hello.addDataScrap(client, scraperdata);
        
        //await hello.addUser(client, userdata);
        //await hello.likeItem(client, userdata, itemdata);
        //await hello.dislikeItem(client, userdata, itemdata);
        //let testGuy = await hello.login(client, loginData);

        

        let testData = await hello.getData(client);

        app.get('/', function (req, res) {
       
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(testData, null, 3));
            
        });
        app.listen(8080);
        console.log("listening on port 8080");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);