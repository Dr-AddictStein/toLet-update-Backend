const express = require("express");
const roommateListCollection = require("../models/roommateList");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { ObjectId } = require("mongodb");

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

router.get("/roommateList", async (req, res) => {
  try {
    const { search, location, sort, gender } = req.query;
  
    let query = {};

    if (search) {
      query["$or"] = [
        {
          "roomateList.contact_person.firstName": {
            $regex: new RegExp(search, "i"),
          },
        },
        {
          "roomateList.contact_person.lastName": {
            $regex: new RegExp(search, "i"),
          },
        },
      ];
    }

    if (location) {
      if (!query["$or"]) {
        query["$or"] = [];
      }
      query["$or"].push(
        {
          "roomateList.description.location.address": {
            $regex: new RegExp(location, "i"),
          },
        },
        {
          "roomateList.description.location.city": {
            $regex: new RegExp(location, "i"),
          },
        }
      );
    }
    // Filter by gender
    if (gender &&
      (gender.toLowerCase() === "female" || gender.toLowerCase() === "male")
    ) {
      query["roomateList.roomatePreferences.gender"] = gender;
    }

    // Sort by rent (price)
    let sortOption = {};
    if (sort === "High To Low") {
      sortOption = { "roomateList.description.rent": -1 };
    } else if (sort === "Low To High") {
      sortOption = { "roomateList.description.rent": 1 };
    }

    const data = await roommateListCollection
      .find(query)
      .sort(sortOption)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});
router.get("/roommateList/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const data = await roommateListCollection
      .find({ "roomateList.description.location.city": city })
      .limit(4)
      .toArray();

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: "No roommate lists found for the provided city." });
    }
  } catch (error) {
    console.error("Error fetching roommate lists by city:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/roommate", async (req, res) => {
  try {
    const data = await roommateListCollection.find().toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/roommate/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // console.log("fffff", id);
    const data = await roommateListCollection.findOne(new ObjectId(id));
    console.log(data);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: "Roommate list not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/add/roommateList", upload.any(), async (req, res) => {
  try {
    console.log("🚀 ~ router.post ~ req.body:", req.body); // This should contain userEmail and userId
    console.log("🚀 ~ router.post ~ req.files:", req.files); // This should contain uploaded files
    // Access userEmail and userId from req.body
    const {
      userEmail,
      userId,
      bedroomType,
      bathroom,
      availableFrom,
      size,
      rent,
      address,
      lat,
      lon,
      city,
      postalCode,
      gender,
      pets,
      smoking,
      employmentStatus,
      userGender,
      firstName,
      lastName,
      phone,
      userEmploymentStatus,
    } = req.body;

    // console.log(req.body)
    // Map filenames from req.files
    //   const filenames = req.files.map((file) => file.filename)
    //   console.log("🚀 ~ router.post ~ filenames:", filenames);
    const parsedSize = parseInt(size, 10);
    const parsedRent = parseFloat(rent);
    let filenames = req.files.map((file) => file.filename);

    // Removing the last element
    filenames = filenames.slice(1);
    //Single image
    const singleImageFilename =
      req.files.length > 0 ? req.files[0].filename : null;
    // Create newRoommateList object
    const newRoommateList = {
      userEmail,
      userId,
      roomateList: {
        description: {
          bedroomType,
          bathroom,
          size: parsedSize,
          rent: parsedRent,
          availableFrom,
          location: {
            address,
            lat,
            lon,
            city,
            postalCode,
          },
        },
        roomatePreferences: {
          gender,
          pets,
          smoking,
          employmentStatus,
        },
        images: filenames,
        contact_person: {
          userGender,
          firstName,
          lastName,
          phone,
          userEmploymentStatus,
          image: singleImageFilename,
        },
      },
    };
    console.log(newRoommateList);
    // Insert newFlatList into the database
    await roommateListCollection.insertOne(newRoommateList);

    // Send a success response
    res.status(201).json({
      message: "Roommate list data added successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/roommateList/:email", async (req, res) => {
  try {
    const email = req.params.email;
    console.log(email);

    const roommateLists = await roommateListCollection
      .find({ userEmail: email })
      .toArray();

    if (roommateLists.length > 0) {
      res.status(200).json({ roommateLists });
    } else {
      res.status(404).json({
        error: "No roommate lists found for the provided email.",
      });
    }
  } catch (error) {
    console.error("Error:", error); // Log the specific error
    res.status(500).json({ error: "Internal server error." });
  }
});


router.patch("/roommateList/:id", upload.any(), async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };

    // Extract the new data from req.body
    const {
      userEmail,
      userId,
      bedroomType,
      bathroom,
      availableFrom,
      size,
      rent,
      address,
      lat,
      lon,
      city,
      postalCode,
      gender,
      pets,
      smoking,
      employmentStatus,
      userGender,
      firstName,
      lastName,
      phone,
      userEmploymentStatus,
    } = req.body;

    // Parse necessary fields to the correct data types
    const parsedSize = parseInt(size, 10);
    const parsedRent = parseFloat(rent);

    // Extract filenames from req.files
    const filenames = req.files.map((file) => file.filename);

    // Define updateOperation object for MongoDB update
    let updateOperation = {
      $set: {
        userEmail,
        userId,
        "roomateList.description.bedroomType": bedroomType,
        "roomateList.description.bathroom": bathroom,
        "roomateList.description.size": parsedSize,
        "roomateList.description.rent": parsedRent,
        "roomateList.description.availableFrom": availableFrom,
        "roomateList.description.location.address": address,
        "roomateList.description.location.lat": lat,
        "roomateList.description.location.lon": lon,
        "roomateList.description.location.city": city,
        "roomateList.description.location.postalCode": postalCode,
        "roomateList.roomatePreferences.gender": gender,
        "roomateList.roomatePreferences.pets": pets,
        "roomateList.roomatePreferences.smoking": smoking,
        "roomateList.roomatePreferences.employmentStatus": employmentStatus,
        "roomateList.contact_person.userGender": userGender,
        "roomateList.contact_person.firstName": firstName,
        "roomateList.contact_person.lastName": lastName,
        "roomateList.contact_person.phone": phone,
        "roomateList.contact_person.userEmploymentStatus": userEmploymentStatus,
      },
    };

    // Check if any files were uploaded
    if (req.files.length > 0) {
      let roomateListUpdateImages = false;
      let contactPersonUpdateImages = false;

      req.files.forEach((file) => {
        if (file.fieldname === "images") {
          roomateListUpdateImages = true;
          // Add new images
          updateOperation.$set["roomateList.images"] = req.files.map(
            (file) => file.filename
          );
        } else if (file.fieldname === "image") {
          // Add new contact person image
          contactPersonUpdateImages = true;
          updateOperation.$set["roomateList.contact_person.image"] =
            file.filename;
        }
      });

      // Remove existing images if any
      const existingImages = await roommateListCollection.findOne(filter, {
        "roomateList.images": 1,
        "roomateList.contact_person.image": 1,
      });

      if (existingImages) {
        if (
          roomateListUpdateImages &&
          existingImages.roomateList &&
          existingImages.roomateList.images
        ) {
          existingImages.roomateList.images.forEach((image) => {
            const imagePath = `images/${image}`;
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          });
        }
        // Only delete the old contact person image if a new one is provided
        if (
          contactPersonUpdateImages &&
          existingImages.roomateList &&
          existingImages.roomateList.contact_person &&
          existingImages.roomateList.contact_person.image
        ) {
          const oldContactPersonImagePath = `images/${existingImages.roomateList.contact_person.image}`;
          if (fs.existsSync(oldContactPersonImagePath)) {
            fs.unlinkSync(oldContactPersonImagePath);
          }
        }
      }
    }

    // Update the roommate list in the database
    const result = await roommateListCollection.updateOne(
      filter,
      updateOperation
    );

    // Check if the update was successful
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Roommate list not found." });
    }

    // Send a success response
    res.status(200).json({ message: "Roommate list updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;

router.delete("/roommateList/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Find the roommate list to be deleted
    const deletedRoommateList = await roommateListCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    // If the roommate list was found and deleted
    if (deletedRoommateList) {
      // Check and unsync associated images
      if (
        deletedRoommateList.roomateList &&
        deletedRoommateList.roomateList.images
      ) {
        deletedRoommateList.roomateList.images.forEach((image) => {
          const imagePath = `images/${image}`;
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }
      if (
        deletedRoommateList.roomateList &&
        deletedRoommateList.roomateList.contact_person &&
        deletedRoommateList.roomateList.contact_person.image
      ) {
        const contactPersonImagePath = `images/${deletedRoommateList.roomateList.contact_person.image}`;
        if (fs.existsSync(contactPersonImagePath)) {
          fs.unlinkSync(contactPersonImagePath);
        }
      }

      res.status(200).json({
        message: "Roommate list deleted successfully.",
      });
    } else {
      // If the roommate list was not found
      res.status(404).json({ error: "Roommate list not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
