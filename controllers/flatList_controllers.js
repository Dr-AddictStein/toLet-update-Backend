const express = require("express");
const UPLOAD_FOLDER = "./public/image";
require("dotenv").config();
const path = require("path");
const multer = require("multer");
const flatListCollection = require("../models/flatList");
const { log } = require("console");
const { ObjectId } = require("mongodb");
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

router.get("/flatList", async (req, res) => {
  try {
    const { search, location, sort, type } = req.query;

    let query = {};

    if (search) {
      query["$or"] = [
        {
          "flatList.contact_person.firstName": {
            $regex: new RegExp(search, "i"),
          },
        },
        {
          "flatList.contact_person.lastName": {
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
          "flatList.description.location.address": {
            $regex: new RegExp(location, "i"),
          },
        },
        {
          "flatList.description.location.city": {
            $regex: new RegExp(location, "i"),
          },
        }
      );
    }

    // Add type filter to the query
    if (type) {
      query["flatList.description.type"] = type;
    }

    // Sort
    let sortOption = {};
    if (sort === "High To Low") {
      sortOption = { "flatList.description.rent": -1 };
    } else if (sort === "Low To High") {
      sortOption = { "flatList.description.rent": 1 };
    }

    const data = await flatListCollection
      .find(query)
      .sort(sortOption)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});
router.get("/flatList/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const data = await flatListCollection
      .find({ "flatList.description.location.city": city })
      .limit(4)
      .toArray();

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: "No flats found for the provided city." });
    }
  } catch (error) {
    console.error("Error fetching flats by city:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/add/flatList", upload.any() , async (req, res) => {
  try {
    console.log("🚀 ~ router.post ~ req.body:", req.body); // This should contain userEmail and userId
    console.log("🚀 ~ router.post ~ req.files:", req.files); // This should contain uploaded files

    // Access userEmail and userId from req.body
    const {
      userEmail,
      userId,
      type,
      availableFrom,
      bedroom,
      bathroom,
      size,
      rent,
      lat,
      lon,
      address,
      city,
      postalCode,
      phone,
      firstName,
      lastName,
      userCity,
      userPostalCode,
    } = req.body;

    // Map filenames from req.files
    //   const filenames = req.files.map((file) => file.filename)
    //   console.log("🚀 ~ router.post ~ filenames:", filenames);

    const parsedSize = parseInt(size, 10);
    const parsedRent = parseFloat(rent);
    // Extract the image filename if available
    // const imageFilename = req.files.length > 0 ? req.files[0].filename : null;
    let filenames = req.files.map((file) => file.filename);

    // Removing the last element
    filenames = filenames.slice(1);
    //Single image
    const singleImageFilename =
      req.files.length > 0 ? req.files[0].filename : null;
    // Create newFlatList object
    const newFlatList = {
      userEmail,
      userId,
      flatList: {
        description: {
          type,
          bedroom,
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
        images: filenames,
        contact_person: {
          firstName,
          lastName,
          userCity,
          userPostalCode,
          phone,
          image: singleImageFilename,
        },
      },
    };
    // console.log(newFlatList);
    // Insert newFlatList into the database
    await flatListCollection.insertOne(newFlatList);

    // Send a success response
    res.status(201).json({ message: "Flat list data added successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/flatDetails", async (req, res) => {
  try {
    const data = await flatListCollection.find().toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/flatDetails/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    console.log("flatId", typeof _id);

    const data = await flatListCollection.findOne(new ObjectId(_id));
    if (data) {
      res.json(data);
    } else {
      console.log("Flat not found for ID:", _id);
      res.status(404).json({ error: "Flat not found." });
    }
  } catch (error) {
    console.error("Error fetching flat details:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/flatList/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const type = req.query.type;
    console.log(type);
    let query = { userEmail: email };

    if (type) {
      query["flatList.description.type"] = type;
    }

    const flats = await flatListCollection.find(query).toArray();

    if (flats.length > 0) {
      res.status(200).json({ flatList: flats });
    } else {
      res.status(404).json({
        error: "No flats found for the provided email.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/flatList/:id", upload.any(), async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };

    const {
      userEmail,
      userId,
      type,
      bedroom,
      bathroom,
      rent,
      size,
      availableFrom,
      lat,
      lon,
      address,
      city,
      postalCode,
      firstName,
      lastName,
      userCity,
      userPostalCode,
      phone,
    } = req.body;

    console.log(lat, lon);
    const parsedSize = parseInt(size, 10);
    const parsedRent = parseFloat(rent);
    const updateDoc = {
      $set: {
        userEmail,
        userId,
        "flatList.description.type": type,
        "flatList.description.bedroom": bedroom,
        "flatList.description.bathroom": bathroom,
        "flatList.description.rent": parsedRent,
        "flatList.description.size": parsedSize,
        "flatList.description.availableFrom": availableFrom,
        "flatList.description.location.address": address,
        "flatList.description.location.city":city,
        "flatList.description.location.postalCode": postalCode,
        "flatList.contact_person.firstName": firstName,
        "flatList.contact_person.lastName":lastName,
        "flatList.contact_person.userCity":userCity,
        "flatList.contact_person.userPostalCode":userPostalCode,
        "flatList.contact_person.phone":phone,
      },
      
    };
    if (req.files.length > 0) {
        req.files.forEach(file => {
            if (file.fieldname === "images") {
                updateDoc.$set["flatList.images"] = req.files.map(file => file.filename);
            } else if (file.fieldname === "image") {
                updateDoc.$set["flatList.contact_person.image"] = req.files[0].filename;
            }
        });
    }
   
    console.log("updateOperation",updateDoc)

    // // Update the roommate list in the database
    const result = await flatListCollection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Flat list not found." });
    }
  

  // Send a success response
  res.status(200).json({ message: "Flat list updated successfully." });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
}
});

// router.patch("/flatList/:id", upload.array("images", 10), async (req, res) => {
//     try {
//         const id = req.params.id;
//         console.log(id);
//         const filter = { _id: new ObjectId(id) };

//         const {
//             userEmail,
//             userId,
//             type,
//             bedroom,
//             bathroom,
//             rent,
//             size,
//             availableFrom,
//             lat,
//             lon,
//             address,
//             city,
//             postalCode,
//             firstName,
//             lastName,
//             userCity,
//             userPostalCode,
//             phone,
//         } = req.body;

//         const location = {};
//         if (address !== undefined) {
//             location.address = address;
//         }
//         if (city !== undefined) {
//             location.city = city;
//         }
//         if (postalCode !== undefined) {
//             location.postalCode = postalCode;
//         }
//         if (lat !== undefined) {
//             location.lat = lat;
//         }
//         if (lon !== undefined) {
//             location.lon = lon;
//         }

//         const updateDoc = {
//             $set: {
//                 userEmail,
//                 userId,
//                 "flatList.description.type": type,
//                 "flatList.description.bedroom": bedroom,
//                 "flatList.description.bathroom": bathroom,
//                 "flatList.description.rent": rent,
//                 "flatList.description.size": size,
//                 "flatList.description.availableFrom": availableFrom,
//             },
//             // Conditionally update the location field only if at least one location property is provided
//             ...(Object.keys(location).length > 0 && { $set: { "flatList.description.location": location } }),
//             "flatList.contact_person": {
//                 firstName,
//                 lastName,
//                 userCity,
//                 userPostalCode,
//                 phone,
//             },
//         };

//         if (req.files.length > 0) {
//             updateDoc.$set["flatList.images"] = req.files.map(
//                 (file) => file.filename
//             );
//         }
//         const updatedFlatList = await flatListCollection.updateOne(
//             filter,
//             updateDoc
//         );

//         console.log("updatedFlatList", updatedFlatList);

//         if (updatedFlatList.modifiedCount === 1) {
//             res.status(200).json({
//                 message: "Flat list updated successfully.",
//             });
//         } else {
//             res.status(404).json({ error: "Flat list not found." });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal server error." });
//     }
// });

router.delete("/flat/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const deletedFlat = await flatListCollection.deleteOne({
      _id: new ObjectId(id),
    });
    // findOne(new ObjectId(itemId));
    if (deletedFlat) {
      res.status(200).json({ message: "Flat deleted successfully." });
    } else {
      res.status(404).json({ error: "Flat not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
