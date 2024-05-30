const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
//   profession: {
//     type: String,
//   },
  about: {
    type: String,
  },
  contact: {
    type: Number,
    trim: true,
  },
});
module.exports = mongoose.model("Profile", profileSchema);
