

var user = require('./userAPI');
module.exports = 
{

//get list of databases
list: async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
},

//add data from scraper to database
addDataScrap: async function addDataScraper(client, data) {


    /*
        data in this format
        {
            "stores": [
            {
                "Company": "Target",
                "Zip_code": "21224-5750",
                "Address_line1": "3559 Boston Street",
                "Address_line2": "",
                "City": "Baltimore",
                "State": "MD",
                "Country": "US",
                "Longitude": 39.275284,
                "Latitude": -76.565947,
                "Store_name": "Baltimore East",
                "Store_id": 2845,
                "Store_items": [
                    {
                       "Product_id": "0",
                       "Product_family": "Bobbie",
                       "Product": "Bobbie Baby Organic Powder Infant Formula - 14oz",
                        "Price": 25.99,
                     "Availability": "IN_STOCK",
                        "Quantity": -1,
                        "Product_url": "https://www.target.com/p/bobbie-baby-organic-powder-infant-formula-14oz/-/A-85776110",
                        "Product_img_url": "https://target.scene7.com/is/image/Target/GUEST_a47d490d-8dca-4c78-9993-07a4e630445a"
                    }
                
                ]
            }
        }
    ]





    */


    const DB = client.db('Stores');
    const DB2 = client.db('Ratings');


    const collection = await DB.collection('Stores'); // or DB.createCollection(nameOfCollection);
    const collection2 = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection);

    //clear out the Stores database
    await collection.remove({})

    //add Store_Id and Company Field to every item listing
    for (x in data.stores) {
    
        let store_Id = data.stores[x].Store_id;
        let company = data.stores[x].Company;
    
        data.stores[x].Store_items.forEach((node) => node.Store_id = store_Id);
        data.stores[x].Store_items.forEach((node) => node.Company = company);

        
    }
    //filter through list of store items and add the iemt to Ratings database if it is not already there
    for (store in data.stores) {

        for (item in data.stores[store].Store_items) {
            let thing = data.stores[store].Store_items[item];


            collection2.update(
                {
                    Product_id: thing.Product_id, Store_id: thing.Store_id, Company: thing.Company
                },
                {
                    $setOnInsert: {
                        Product_id: thing.Product_id, Product_family: thing.Product_family, Product: thing.Product,
                        Price: thing.Price, Availability: thing.Availability, Store_id: thing.Store_id, Company: thing.Company,
                        Quantity: thing.Quantity, Product_url: thing.Product_url, Product_img_url: thing.Product_img_url,
                        Likes: 0, Dislikes: 0, Rating: "Unrated"
                    }
                },
                { upsert: true }
            )
        }



    }

    await collection.insert(data);
    
    
},



//links to addUser function in user.js
addUser: async function add_user(client, userData)
{
   

    return user.addUser(client, userData);
    
    
},

//links to verifyPassword function in login.js
verifyPass: async function verifyPass(client, login)
{
        return user.verifyPass(client, login);

},
//links to verifyEmail function in login.js
verifyEmail: async function ver(client, login)
{
        return user.verifyEmail(client, login);

},

// function for when an item is liked or conversely unliked
likeItem: async function item_liked(client, userData, itemData) {

    
    /*
        Userdata in this format 
        {
            "UserName": "Bruhseph"
        }

        itemData in this format
        {
            "Company": "Target",
            "Product_id": "0",
            "Store_id": 2845,
            "Availability": "IN_STOCK",
            "Dislikes": "0",
            "Likes": "0",
            "Price": 25.99,
            "Product": "Bobbie Baby Organic Powder Infant Formula - 14oz",
            "Product_family": "Bobbie",
            "Product_img_url": "https://target.scene7.com/is/image/Target/GUEST_a47d490d-8dca-4c78-9993-07a4e630445a",
            "Product_url": "https://www.target.com/p/bobbie-baby-organic-powder-infant-formula-14oz/-/A-85776110",
            "Quantity": -1,
            "Rating": "Unrated"
        }
            

        


    */

    const DB = client.db('Users');//connect to Users DB

    const collection = await DB.collection('Users'); // or DB.createCollection(nameOfCollection); 
    
    const DB2 = client.db('Ratings');//connect to Ratings DB

    const collection2 = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection); 


    //get user profile
    const user =  await collection.findOne(

        { UserName: userData.UserName }


    );
    //get liked item ratings profile
    let item = await collection2.findOne(
        { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id }

    );
    //get liked array from user profile
    const liked = user.Liked;
    //get disliked array from user profile
    const disliked = user.DisLiked;
        
    //find if item that was liked is in liked array
    const filtered = liked.filter(el => el.Product_id !== itemData.Product_id
        && el.Company !== itemData.Company && el.Store_id !== itemData.Store_id);


    //item is in liked(was previously liked)
    if (filtered.length != liked.length) {
        var myquery = { UserName: userData.UserName };
        var newvalues = { $set: { Liked: filtered } };
        //updated User liked array to have the item removed
        
        collection.updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;

        });

        //decrement likes in Rating DB
        item.Likes--;
        const total = item.Likes + item.Dislikes;
        
        //recalculate Rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        
        //update entry in Rating DB
        var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues2 = { $set: { Likes: item.Likes, Rating: item.Rating } };
        collection2.updateOne(myquery2, newvalues2, function (err, res) {
            if (err) throw err;

        });
        //return user profile
        const user =  await collection.findOne(

            { UserName: userData.UserName }


        );
        return user;
    
    }
    //item is not in liked array(not previously liked)
    else {

        
        const filteredDis = disliked.filter(el => el.Product_id !== itemData.Product_id
            && el.Company !== itemData.Company && el.Store_id !== itemData.Store_id);

        //item is in disliked(was previously disliked)
        if (filteredDis.length != disliked.length) {

            var myqueryD = { UserName: userData.UserName };
            var newvaluesD = { $set: { DisLiked: filteredDis ,Liked: liked } };
            //updated User disliked array to have the item removed and liked array to have item added
            delete itemData.Dislikes;
            delete itemData.Likes;
            delete itemData.Rating;
            liked.push(itemData);
            collection.updateOne(myqueryD, newvaluesD, function (err, res) {
                if (err) throw err;
    
            });
    
            
        
            //increment likes in Ratings DB
            console.log(item.Dislikes);
            item.Likes++;
            //decrement dislikes in Rating DB
            item.Dislikes--;
            const total = item.Likes + item.Dislikes;
            //recalculate rating
            if(total  == 0)
            {
                item.Rating = "Unrated";
            }   
            else
            {
                const ratingPercentage = (item.Likes/ total)*100;
                item.Rating = ratingPercentage.toString();
            }
            //update Rating DB
            var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
            var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating } };
            collection2.updateOne(myquery2, newvalues2, function (err, res) {
                if (err) throw err;

            });
            
            
        
        }
        else{

        delete itemData.Dislikes;
        delete itemData.Likes;
        delete itemData.Rating;
        liked.push(itemData);
        var myquery = { UserName: userData.UserName };
        var newvalues = { $set: { Liked: liked } };
        //update User array to have item in liked array
        collection.updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;

        });
        //increment likes in Ratings DB
    
        item.Likes++;
        const total = item.Likes + item.Dislikes;
        //recalculate rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        //update Rating DB
        var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating } };
        collection2.updateOne(myquery2, newvalues2, function (err, res) {
            if (err) throw err;

        });
        //return user profile
        const user =  await collection.findOne(

            { UserName: userData.UserName }


        );
        return user;
        }
    }


},

//function for when item is disliked or conversely undisliked 
dislikeItem:  async function item_disliked(client, userData, itemData) {


    /*
        Userdata in this format 
        {
            "UserName": "Bruhseph"
        }

        itemData in this format
        {
            "Company": "Target",
            "Product_id": "0",
            "Store_id": 2845,
            "Availability": "IN_STOCK",
            "Dislikes": "0",
            "Likes": "0",
            "Price": 25.99,
            "Product": "Bobbie Baby Organic Powder Infant Formula - 14oz",
            "Product_family": "Bobbie",
            "Product_img_url": "https://target.scene7.com/is/image/Target/GUEST_a47d490d-8dca-4c78-9993-07a4e630445a",
            "Product_url": "https://www.target.com/p/bobbie-baby-organic-powder-infant-formula-14oz/-/A-85776110",
            "Quantity": -1,
            "Rating": "Unrated"
        }

    */

    const DB = client.db('Users');//connect to Users DB

    const collection = await DB.collection('Users'); // or DB.createCollection(nameOfCollection); 
    
    const DB2 = client.db('Ratings');//connect to Ratings DB

    const collection2 = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection); 


    //get user profile
    const user =  await collection.findOne(

        { UserName: userData.UserName }


    );
    //get liked item ratings profile
    let item = await collection2.findOne(
        { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id }

    );
    //get liked array from user profile
    const liked = user.Liked;
    //get disliked array from user profile
    const disliked = user.DisLiked;
        
    //find if item that was disliked is in disliked array
    const filtered = disliked.filter(el => el.Product_id !== itemData.Product_id
        && el.Company !== itemData.Company && el.Store_id !== itemData.Store_id);


    //item is in disliked(was previously disliked)
    if (filtered.length != disliked.length) {
        var myquery = { UserName: userData.UserName };
        var newvalues = { $set: { DisLiked: filtered } };
        //updated User liked array to have the item removed
        
        collection.updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;

        });

        //decrement dislikes in Rating DB
        item.Dislikes--;
        const total = item.Likes + item.Dislikes;
        
        //recalculate Rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        
        //update entry in Rating DB
        var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues2 = { $set: { Dislikes: item.Dislikes, Rating: item.Rating } };
        collection2.updateOne(myquery2, newvalues2, function (err, res) {
            if (err) throw err;

        });
        //return user profile
        const user =  await collection.findOne(

            { UserName: userData.UserName }


        );
        return user;
    
    }
    //item is not in disliked array(not previously disliked)
    else {

        
        const filteredDis = liked.filter(el => el.Product_id !== itemData.Product_id
            && el.Company !== itemData.Company && el.Store_id !== itemData.Store_id);

        //item is in liked(was previously liked)
        if (filteredDis.length != liked.length) {

            var myqueryD = { UserName: userData.UserName };
            var newvaluesD = { $set: { Liked: filteredDis ,DisLiked: disliked } };
            //updated User disliked array to have the item removed and liked array to have item added
            delete itemData.Dislikes;
            delete itemData.Likes;
            delete itemData.Rating;
            disliked.push(itemData);
            collection.updateOne(myqueryD, newvaluesD, function (err, res) {
                if (err) throw err;
    
            });
    
            
        
            //increment dislikes in Ratings DB
            item.Dislikes++;
            //decrement Likes in Rating DB
            item.Likes--;
            const total = item.Likes + item.Dislikes;
            //recalculate rating
            if(total  == 0)
            {
                item.Rating = "Unrated";
            }   
            else
            {
                const ratingPercentage = (item.Likes/ total)*100;
                item.Rating = ratingPercentage.toString();
            }
            //update Rating DB
            var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
            var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating } };
            collection2.updateOne(myquery2, newvalues2, function (err, res) {
                if (err) throw err;

            });
            
            
        
        }
        else{
            
        delete itemData.Dislikes;
        delete itemData.Likes;
        delete itemData.Rating;
        disliked.push(itemData);
        var myquery = { UserName: userData.UserName };
        var newvalues = { $set: { DisLiked: disliked } };
        //update User array to have item in disliked array
        collection.updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;

        });
        //increment dislikes in Ratings DB
      
        item.Dislikes++;
        const total = item.Likes + item.Dislikes;
        //recalculate rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        //update Rating DB
        var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating } };
        collection2.updateOne(myquery2, newvalues2, function (err, res) {
            if (err) throw err;

        });
        //return user profile
        const user =  await collection.findOne(

            { UserName: userData.UserName }


        );
        return user;
        }
    }


},

//function to retrive data for frontend
getData: async function get_data(client)
{


    const DB = client.db('Stores');
    const DB2 = client.db('Ratings');



    const collection = await DB.collection('Stores'); // or DB.createCollection(nameOfCollection);
    const collection2 = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection);
    //get list of items in stores
    let findResult = await collection.findOne(
       // 'stores' : { 'Store_id': "2845" }
        //{Company: "Target", Product_id: "0",  Store_id: 2845 }
        
    );
    
    //merge the entries in Ratings with the coresponding item in store list
    for (store in findResult.stores) {

        for (item in findResult.stores[store].Store_items) {
            let thing = findResult.stores[store].Store_items[item];

            let replace = await collection2.findOne(
                { Company: thing.Company, Store_id: thing.Store_id, Product_id: thing.Product_id }

            );
            findResult.stores[store].Store_items[item] = replace;
        }



    }
    return findResult;
    
    /*if ((await findResult.count()) === 0) {
        console.log("No documents found!");
    }*/
   // await findResult.forEach(doc => console.log(doc);

}
};