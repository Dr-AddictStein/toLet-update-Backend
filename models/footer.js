const client = require("../client/mongo");

const footerCollection = client.db("to-let").collection("footer");
module.exports = footerCollection;