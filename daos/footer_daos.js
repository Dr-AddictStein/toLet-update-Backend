const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema({
  facebook: {
    type: String,
   
  },
  twitter: {
    type: String,
  },
  instagram: {
    type: String,
  },
  whatsapp: {
    type: String,
   
  }
});

const Footer = mongoose.model('footer', footerSchema);

module.exports = Footer;
