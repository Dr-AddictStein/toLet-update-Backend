const express = require("express");
const router = express.Router();
const userCollection = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongodb");
const UPLOAD_FOLDER = "./public/image";
var nodemailer = require("nodemailer");

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

// Email pass signup
router.post("/signup", upload.single("images"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      address,
      city,
      postalCode,
    } = req.body;
    const filenames = req.file.filename;
    // Check if required fields are present
    if (!firstName || !lastName || !email || !password) {
      throw new Error("All fields are required");
    }

    // Perform duplicate checks
    const existingUserByEmail = await userCollection.findOne({ email });

    if (existingUserByEmail) {
      return res.status(400).json({
        error:
          "An account with this email already exists. Please use a different email.",
      });
    }

    // Hash password and create new user object
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      user_image: filenames,
      age,
      location: { address, city, postalCode },
      role:"user"
    };
    console.log("SSS",newUser);
    const data = await userCollection.insertOne(newUser);
    // console.log(newUser)


    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to verify token
router.get("/verifyToken", verifyToken, (req, res) => {
  // console.log("dsf",req.user)
  // { auth: true, token, email: user.email }
  res.status(200).json({ auth: true, user: req.user.user });
});

// Email pass login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Input validation:
    if (!email || !password) {
      throw new Error("Both email and password are required.");
    }

    // Search by email only:
    const user = await userCollection.findOne({ email });

    // console.log(user);
    // Handle cases where no user is found or password is incorrect:
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid email or password." });
      return; // Prevent duplicate error message in case both conditions are met
    }

    const token = jwt.sign({ user }, "12345fhhhfkjhfnnvjfjjfjjfjfjjfjf", {
      expiresIn: "7d",
    });

    // console.log(token);

    res.json({ auth: true, token, user: user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

//!-----------reset password----------
// router.post('/reset-password', async (req, res) => {
//   try {
//       const { email } = req.body;
//       console.log(email);
//       const user = await userCollection.findOne({ email });
//       if (!user) {
//           return res.status(400).json({ message: 'Email not exist.' });
//       }
//       const otp = Math.floor(100000 + Math.random() * 900000);
//       const info = await transporter.sendMail({
//           from: '"Fred Foo 👻" <testmail@gmail.com>',
//           to: `${email}`,
//           subject: "Hello ✔",
//           text: "Password reset.",
//           html: `
//               <b>Hello ${user.name}. Please confirm your otp.</b>
//               <b>Please cheek mail and verify otp and reset password.</b>
//               <h1>${otp}</h1>
//           `,
//       });
//       const result = await userCollection.updateOne({ _id: user._id }, { otp });
//       console.log(result);
//       res.status(200).json({ message: 'Please cheek mail and verify otp and reset password.' });
//   } catch (error) {
//       console.log(error?.message);
//   }
// });

// router.post('/confirm-reset-password', async (req, res) => {
//   try {
//       const { otp, password } = req.body
//       const valid = await userCollection.findOne({ otp });
//       if (!valid) {
//           return res.status(400).json({ message: 'otp does not exist.' });
//       }
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const result = await userCollection.updateOne({ _id: valid._id }, { password: hashedPassword });
//       console.log(result);
//       return res.status(200).json({ message: 'Password reset successfully' });
//   } catch (error) {
//       console.log(error);
//   }
// })
router.post("/forgot-password/:email", async (req, res) => {
  const email = req.params.email;
  console.log("🚀 ~ router.post ~ email:", email);

  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.send({ Status: "User not existed" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "algobot701@gmail.com",
        pass: "fvpj cgjn kbim mvgy",
      },
    });

    var mailOptions = {
      from: "algobot701@gmail.com",
      to: user.email,
      subject: "Reset Password Link",
      text: `https://to-lets.netlify.app/reset_password/${user._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: "Success" });
      }
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send({ Status: "Error" });
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  console.log(password);
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.json({ Status: "Error with token" });
    }

    // Hash the new password
    const hash = await bcrypt.hash(password, 10);

    // Update the user's password
    const result = await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hash } }
    );

    if (result.modifiedCount === 1) {
      // Password updated successfully
      return res.send({ Status: "Success" });
    } else {
      // No document was modified (no user found with the provided ID)
      return res.status(404).json({ Status: "User not found." });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send({ Status: "Error" });
  }
});
// handle google login and signup
router.post("/user", async (req, res) => {
  const { firstName, lastName, email, user_image } = req.body;
  const query = { email: email };

  const existingUser = await userCollection.findOne(query);
  if (!existingUser) {
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email,
        password: "",
        user_image,
        age: "",
        phone: "",
        location: {
          address: "",
          city: "",
          postalCode: "",
        },
        role:"user"
      };

      const insertedData = await userCollection.insertOne(userData);
  }

  const user = await userCollection.findOne(query);
  const token = jwt.sign(
    user,
    "12345fhhhfkjhfnnvjfjjfjjfjfjjfjf",
    {
      expiresIn: "7d",
    }
  );
  res.json({ auth: true, token, user: user });
});
router.get("/users", async (req, res) => {
  try {
    const { searchValue } = req.query;

    const filter = {};
    if (searchValue) {
      filter.$or = [
        { firstName: { $regex: new RegExp(`\\b${searchValue}\\b`, "i") } },
        { lastName: { $regex: new RegExp(`\\b${searchValue}\\b`, "i") } },
      ];
    }

    const users = await userCollection.find(filter).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});
router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await userCollection.findOne({ email });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/update/:email", upload.single("images"), async (req, res) => {
  try {
    const email = req.params.email;
    const {
      firstName,
      lastName,
      age,
      address,
      city,
      postalCode,
      phone,
      password,
      oldPass,
      isUpdate,
    } = req.body;
    console.log("🚀 ~ router.patch ~ req.body:", req.body)
    const filename = req.file ? req.file.filename : undefined;
    const newPassword = password ? password : undefined;

    // Retrieve existing user data
    const existingUser = await userCollection.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const userToUpdate = {
      firstName,
      lastName,
      age,
      phone,
      location: { address, city, postalCode },
    };

    if (isUpdate == "False" && newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      userToUpdate.password = hashedPassword;
    } else if (isUpdate == "True") {
      userToUpdate.password = oldPass;
    }
    const paths = "http://localhost:5000/images/";
    // Update fields provided in the request body
    if (filename) userToUpdate.user_image = paths+filename;

    console.log(userToUpdate);
    // Update user data in the database
    const result = await userCollection.updateOne(
      { email },
      { $set: userToUpdate }
    );
    const updatedUser = await userCollection.findOne({ email });
    const token = jwt.sign(
      { updatedUser },
      "12345fhhhfkjhfnnvjfjjfjjfjfjjfjf",
      {
        expiresIn: "7d",
      }
    );

    res.json({ auth: true, token, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


router.delete("/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete the user
    const deletedUser = await userCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (deletedUser.deletedCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
