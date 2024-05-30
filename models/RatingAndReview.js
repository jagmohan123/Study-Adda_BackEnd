const mongoose = require("mongoose");
const RatingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  // some thing we have to add here 
  course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},
});
module.exports = mongoose.model("RatingAndReview", RatingAndReviewSchema);
