const client = require("../client/mongo");

const roommateListCollection = client.db("to-let").collection("roommateList");
module.exports = roommateListCollection;
