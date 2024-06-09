const client = require("../client/mongo");

const userCollection = client.db("to-let").collection("user");
module.exports = userCollection;







