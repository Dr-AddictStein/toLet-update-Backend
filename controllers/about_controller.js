const express = require("express");
const aboutCollection = require("../models/about");
const { ObjectId } = require("mongodb");

require("dotenv").config();

const router = express.Router();

router.get("/about", async (req, res) => {
  try {
    const footer = await aboutCollection.find().toArray();
    res.json(footer);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/api/about", async (req, res) => {
    try {
     
      const { description } = req.body;
   console.log(description);
     
      const result = await aboutCollection.insertOne({ description });
  
      res.status(201).json({ message: "Description added successfully", insertedId: result.insertedId });
    } catch (error) {
    
      console.error("Error adding description:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });
  
  router.patch("/about/:id", async (req, res) => {
    try {
      const { id } = req.params
      const { description } = req.body;
    // console.log(id, description);
      // Update the description in the database
      const result = await aboutCollection.updateOne(
        { _id: new ObjectId (id) },
        { $set: 
            { description: description }
         },
        
      );
  
      if (!result) {
        return res.status(404).json({ error: "About document not found." });
      }
  
      res.json({ message: "Description updated successfully", result });
    } catch (error) {
      console.error("Error updating description:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });





module.exports = router;
