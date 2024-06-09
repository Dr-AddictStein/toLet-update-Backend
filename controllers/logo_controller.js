const express = require("express");
const logoCollection = require("../models/logo");
const multer = require("multer");
const path = require("path");

require("dotenv").config();

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      if (file) {
        const fileExt = path.extname(file.originalname);
        const fileName =
          file.originalname
            .replace(fileExt, "")
            .toLowerCase()
            .split(" ")
            .join("-") +
          "-" +
          Date.now();
        console.log("🚀 ~ fileName:", fileName);
        cb(null, fileName + fileExt);
      }
    },
  });
  
  var upload = multer({
    storage: storage,
  });

router.get("/logo", async (req, res) => {
  try {
    const data = await logoCollection.find().toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/logoUpdate", upload.single("images"), async (req, res) => {
    try {
      const filename = req.file.filename;
      const imagePath = `http://localhost:5000/images/${filename}`;
  
      const newLogo = { imagePath };
  
      await logoCollection.deleteMany({});

      const result = await logoCollection.insertOne(newLogo);
  
      res.status(201).json({
        message: "Logo added successfully",
        data: newLogo,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  






module.exports = router;
