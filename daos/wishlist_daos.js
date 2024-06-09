const mongoose = require("mongoose");

const wishListSchema = mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  flatWishList: [
    {
      id: {
        type: String,
        required: true,
      },
      flatList: {
        description: {
          type: {
            type: String,
            required: true,
          },
          bedroom: Number,
          bathroom: Number,
          size: Number,
          rent: Number,
          availableFrom: Date,
          location: {
            address: String,
            city: String,
            postalCode: String,
            lat:Number,
            lon:Number
          },
        },
        images: [String],
        contact_person: {
          firstName: String,
          lastName: String,
          userCity: String,
          userPostalCode: String,
          phone: String,
        },
      },
    },
  ],
  roommateWishList: [
    {
      id: {
        type: String,
        required: true,
      },
      roomateList: {
        description: {
          bedroomType: String,
          bathroom: Number,
          size: Number,
          rent: Number,
          availableFrom: Date,
          location: {
            address: String,
            city: String,
            postalCode: String,
            lat:Number,
            lon:Number
          },
        },
        roomatePreferences: {
          gender: String,
          pets: String,
          smoking: String,
          employmentStatus: String,
        },
        images: [String],
        contactPerson: {
          userGender: String,
          firstName: String,
          lastName: String,
          phone: String,
          userEmploymentStatus: String,
        },
      },
    },
  ],
});

module.exports = mongoose.model("wishlist", wishListSchema);
