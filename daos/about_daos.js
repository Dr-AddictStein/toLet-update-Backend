const mongoose = require("mongoose");

const aboutSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("about", aboutSchema);
