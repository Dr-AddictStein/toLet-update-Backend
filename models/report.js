const client = require("../client/mongo");

const reportListCollection = client.db("to-let").collection("reportList");
module.exports = reportListCollection;