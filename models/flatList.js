const client = require("../client/mongo");

const flatListCollection = client.db("to-let").collection("flatList");
module.exports = flatListCollection;
