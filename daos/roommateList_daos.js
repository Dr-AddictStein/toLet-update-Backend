const mongoose = require("mongoose");

const roommateListSchema = mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  roomateList: {
    description: {
      bedroomType: {
        type: String,
        required: true,
      },
      bathroom: {
        type: Number,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      rent: {
        type: Number,
        required: true,
      },
      availableFrom: {
        type: Date,
        required: true,
      },
      location: {
        address: {
          type: String,
          required: true,
        },
        lat: {
          type: Number,
          required: true,
        },
        lon: {
          type: Number,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
      },
    },
    roomatePreferences: {
      gender: {
        type: String,
        required: true,
      },
      pets: {
        type: String,
        required: true,
      },
      smoking: {
        type: String,
        required: true,
      },
      employmentStatus: {
        type: String,
        required: true,
      },
    },
    images: {
      type: [String],
      required: true,
    },
    contactPerson: {
      userGender: {
        type: String,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      userEmploymentStatus: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
    },
    },
  },
});

module.exports = mongoose.model("roommateList", roommateListSchema);
