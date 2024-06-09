const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri = process.env.DB_URI

const client = new MongoClient(
  "mongodb+srv://to-let:HujdZURNr4yeTWlS@cluster0.6nxonq0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }
);

module.exports = client;
