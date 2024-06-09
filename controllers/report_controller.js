const express = require("express");
const reportListCollection = require("../models/report");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const router = express.Router();

router.post("/reportList", async (req, res) => {
    try {
      // Extract data from req.body
      const {reportMessage,flatWishList, roommateWishList } = req.body;
        console.log(reportMessage, flatWishList, roommateWishList);
      // Create a new wishlist document
      const newReportList = {
        reportMessage,
        flatWishList,
        roommateWishList,
      };
  
      // Insert the document into the collection
      await reportListCollection.insertOne(newReportList);
  
      res
        .status(201)
        .json({
          message: "report created successfully",
          report: newReportList,
        });
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });


  router.get("/reports", async (req, res) => {
    try {
      const report = await reportListCollection.find().toArray();
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Internal server error." });
    }
  });
  
  router.delete('/reportLists/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        console.log(itemId);
        const item = await reportListCollection.findOne(new ObjectId(itemId));
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
  
        // Delete the item by specifying id
        await reportListCollection.deleteOne({ _id: new ObjectId(itemId) });
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  module.exports = router;