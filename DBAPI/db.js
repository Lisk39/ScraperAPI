const { MongoClient } = require('mongodb');
require('dotenv').config();

const Mongouri = "mongodb+srv://"+process.env.NAME+":"+process.env.PASS+"@formulafinder.af9sce2.mongodb.net/?retryWrites=true&w=majority";

const Client = new MongoClient(Mongouri);

async function connect()
{

try {
  await Client.connect();
} catch(e) {
  console.error(e);
}

}
connect();
module.exports =
{
  close: async function close()
  {
    await Client.close();
  },

 client: Client,
 
 url: Mongouri


}