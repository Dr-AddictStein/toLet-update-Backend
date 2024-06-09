const client = require("../client/mongo");

const wishListCollection = client.db("to-let").collection("wishlist");
module.exports = wishListCollection;
