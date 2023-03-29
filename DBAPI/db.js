

const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */

const Mongouri = "mongodb+srv://"+process.env.NAME+":"+process.env.PASS+"@formulafinder.af9sce2.mongodb.net/?retryWrites=true&w=majority";

const Client = new MongoClient(Mongouri);

//connect to MongoDB
async function connect()
{

try {
  await Client.connect();
} catch(e) {
  console.error(e);
}

}
connect();

//export client and url so other files will beable to use the same connection
module.exports =
{
  close: async function close()
  {
    await Client.close();
  },

 client: Client,
 
 url: Mongouri


}