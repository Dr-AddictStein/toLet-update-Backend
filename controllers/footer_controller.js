const express = require("express");
const footerCollection = require("../models/footer");
const { ObjectId } = require("mongodb");

require("dotenv").config();

const router = express.Router();

router.get("/footer", async (req, res) => {
  try {
    const footer = await footerCollection.find().toArray();
    res.json(footer);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post('/footer', async (req, res) => {
    try {
      
      const { facebook, twitter, instagram, whatsapp } = req.body;
      const newFooter = {
        facebook,
        twitter,
        instagram,
        whatsapp
      };
  
      const result = await footerCollection.insertOne(newFooter);
  
      res.status(201).json({ message: "Description added successfully", insertedId: result.insertedId });
    } catch (error) {
    
      console.error("Error adding socialMedia:", error);
      res.status(500).json({ error: "Internal server error." });
    }
    
  });

  router.patch("/footer/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const { facebook, twitter, instagram, whatsapp } = req.body;
  console.log(facebook, twitter, instagram, whatsapp );
      // Update the footer document in the database
      const result = await footerCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: 
            { facebook:facebook, 
            twitter:twitter, 
            instagram:instagram, 
            whatsapp:whatsapp } }
      );

      res.json({ message: "Footer links updated successfully" });
    } catch (error) {
      console.error("Error updating footer links:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });




module.exports = router;
