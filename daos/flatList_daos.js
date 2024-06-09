const mongoose = require("mongoose");

const flatListSchema = mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  flatList: {
    description: {
      type: {
        type: String,
        required: true,
      },
      bedroom: {
        type: Number,
        required: true,
      },
      bathroom: {
        type: Number,
        required: true,
      },
      rent: {
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
    images: {
      type: [String],
      required: true,
    },
    contact_person: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      userCity: {
        type: String,
        required: true,
      },
      userPostalCode: {
        type: String,
        required: true,
      },
      phone: {
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

module.exports = mongoose.model("flatList", flatListSchema);
