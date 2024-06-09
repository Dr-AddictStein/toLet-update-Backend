const client = require("../client/mongo");

const aboutCollection = client.db("to-let").collection("about");
module.exports = aboutCollection;