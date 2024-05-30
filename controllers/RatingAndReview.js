const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");
const User = require("../models/User");

// createRating and review
exports.createRatingAndReview = async (req, res) => {
    try {
        // find the user who want to review 
        const userId = req.user
        .id;
        // fetch the data from the body 
        const { courseId, rating, review } = req.body;

        // check if user is enrolled in course or not 
        const courseDetails = await Course.findOne({
            _id: courseId,
            // studentEnrolled array ke anadar ye userId match hui to 
            studentEnrolled: { $elemMatch: { $eq: userId } },
        });

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student not enrolled in this course"
            });
        }


        // check a student is already review or not if already review we can not allow to student for again review to the course 
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if (alreadyReviewed) {
            return res.status(500).json({
                success: false,
                message: "Student already reviewed this course "
            })
        }

        // create the rating and review
        const newRatingAndReviews = await RatingAndReview.create({
            review, rating,
            course: courseId,
            user: userId
        })

        // update the course schema bcs course schema contain rating and review array
        const updatedCourse = await Course.findByIdAndUpdate({ _id: courseId }, {
            $push: {
                ratingAndReviews: newRatingAndReviews._id,
            }
        }, { new: true });

        console.log(updatedCourse);
        // return the response 
        return res.status(201).json({
            success: true,
            message: "Rating and Reviews created succssfully",
            ratingAndReviews: newRatingAndReviews,
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Can't create the rating and review, Internal server problem ",
            error: error.message
        });
    }

}


// getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
        // need course id that means kon se course me rate and review kar rhe ho 
        const courseId = req.body.courseId;
        // calculate the avarage rating 

        // aggerate function se we get only single value averageRating from  line no.87 to 97
        const result = await RatingAndReview.aggregate([
            {
                // rating and review schema ke andar course name ke array me jakar ke check karo courseId present hai 
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },

            // agar courseid prsent hai to jitni id hai sab ko group kar do than unka average calculate kar do 
            // and jo average result aae uska name averageRating de do
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "rating" },
                }
            }
        ]);

        // if  rating found return result 
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        // if NO rating found return result 

        return res.status(200).json({
            success: true,
            averageRating: 0,
            message: "Average Rating is 0, no rating and review found till now "
        })


    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Can't create the Average rating and review, Internal server problem ",
            error: error.message
        });
    }
}


// get all the rating and reviews
exports.getAllRatingsAndReviews = async (req, res) => {
    console.log("Hello G");
    try {

        const getAllRatingReviews = await RatingAndReview.find({}).
            sort({ rating: "desc" })
            .populate({
                path: "user",
                // only rating and review contain below 5things
                select: "firstName lastName email image",
            }).populate({
                path: "course",
                // only the courseName need when you get all the review and ratings 
                select: "courseName"
            }).exec();

        // retun response 
        return res.status(200).json({
            success: true,
            data: getAllRatingReviews,
            message: " All rating and reviews fetched "
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Can't get all Rating and review, Internal server problem ",
            error: error.message
        });
    }
}