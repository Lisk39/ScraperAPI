
module.exports = 
{

    //function to add User to Database
    addUser: async function add_user(client, userData)
    {
   
        /*
            assumption is that the incoming data from the frontend is a json in this format:

            "UserName": "Broseph",
            "Email":  "johndoe@gmail.com",
            "Password":  "986864656588" (hashed or encrypted in frontend before being sent to api)

        */

        const DB = client.db('Users'); //connect to DB

        const collection = await DB.collection('Users'); // or DB.createCollection(nameOfCollection);

        const userNameExists = await collection.countDocuments({ UserName: userData.UserName }); // check if uname taken

        
        
        //uname is not taken
        if (userNameExists == 0) { 
            //add permissions field
            userData.Permission = "User";
            //add liked items field
            userData.Liked = [];
            // add disliked items field
            userData.DisLiked = [];
            // insert into DB
            await collection.insert(userData);
            //return the created user profile
            return userData;
        
        }
        //uname taken
        else {
            throw new Error("Username taken")
        }
    
    
    },
    //function to login
    login: async function login(client, login)
    {
        /*
            assumption is that the incoming data from the frontend is a json in this format:

            "UserName": "Broseph",
            "Password":  "986864656588" (hashed or encrypted in frontend before being sent to api)

        */
        const DB = client.db('Users'); //conecct to DB

        const collection = await DB.collection('Users'); // or DB.createCollection(nameOfCollection);

        const userNameExists = await collection.countDocuments({ UserName: login.UserName }); //Check if username is in DB
        
        
        //if Username found
        if (userNameExists != 0) {
            //retrieve user profile
            const user =  await collection.findOne(
 
                { UserName: login.UserName }
    
    
            );
            //compare password inputted and on record
            if(login.Password === user.Password) //passwords match
            {
                //remove password from user profile that we have retrived(not the version stored in DB)
                delete user.Password;
                //return user profie
                return user;
            }
            //passwords do not match
            else{
                throw new Error("User not found")
            }
        
        }
        //username not found
        else {
            throw new Error("User not found")
        }
        


    }
    
    
}