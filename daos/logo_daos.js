const mongoose = require("mongoose");

const logoSchema = mongoose.Schema({
  image: {
    type: String,
  },
});

module.exports = mongoose.model("logo", logoSchema);
