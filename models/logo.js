const client = require("../client/mongo");

const logoCollection = client.db("to-let").collection("logo");
module.exports = logoCollection;