

const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const uploadImageToCloudinary = require("../utility/uploadImageToCloudinary");
const convertSecondsToDuration = require("../utility/SecToTimeDuration");
const CourseProgress = require("../models/CourseProgress");

require("dotenv").config();
// updare profile information
exports.updateProfile = async (req, res) => {
  try {
    // get the data
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contact = "",
      gender = "",
    } = req.body;
    // find the userId
    const id = req.user.id;

 

    //find user details
    const userDetails = await User.findById(id);
    console.log("user found", userDetails);
    // find the profile details by id
    const profile = await Profile.findById(userDetails.additionalDetails);
    // upadte the user schema
    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    });
    // save the updated profile
    await user.save();

    // update the profile details
    // we allready create the object so instead of creat() method we use here save() method
    profile.dateOfBirth = dateOfBirth;
    profile.contact = contact;
    profile.gender = gender;
    profile.about = about;

    await profile.save();

    // find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    console.log("update details is ", updatedUserDetails);

    // return the response
    return res.status(200).json({
      success: true,
      message: "Profile details has been updated ",
      updatedUserDetails,
    });
  } catch (error) {
    console.log("Kya hua", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while updating the profile data, Internal server Problem ",
    });
  }
};

// Delete the user Account
exports.deleteAccouunt = async (req, res) => {
  try {
    // get the id
    const id = req.user.id;
    // validate the id
    console.log("user id is ", id);
    const userDetails = await User.findById({ _id: id });
    console.log("User Details", userDetails);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: " user not found  ",
      });
    }

    const updatedUser = await User.findByIdAndDelete(userDetails._id);
    console.log("Updated user schema is ", updatedUser);

   

    res.status(200).json({
      success: true,
      message: "User Account has been deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while deleting the User Account, Internal server Problem ",
    });
  }
};

// get All the users
exports.getAllUser = async (req, res) => {
  try {
    // get the user id
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    //return the response
    return res.status(200).json({
      success: true,
      message: "All the users details are given below",
      user: userDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while fetching all the user , Internal server Problem ",
    });
  }
};

// update profileImage
exports.updateProfileImage = async (req, res) => {
  try {
    // fetch the profile image  from the req.files;
    const profilePhoto = req.files.updateProfileImage;
    const userId = req.user.id;
    // upload image in cloudinary
    const uploadedImage = await uploadImageToCloudinary(
      profilePhoto,
      process.env.PROFILE_IMAGE_FOLDER,
      1000,
      1000
    );
    console.log("Uploaded Image", uploadedImage);
    // update the user schema image url
    const updateUserSchema = await User.findByIdAndUpdate(
      { _id: userId },
      { image: uploadedImage.secure_url },
      { new: true }
    );
    console.log("Updated user Schema is ", updateUserSchema);

    //return the response
    res.status(201).json({
      success: true,
      message: `Profile Image Updated successfully`,
      data: updateUserSchema,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Can't Update profile Picture, Internal Server Problem ",
      error: error.message,
    });
  }
};

// For student is enrolled any course or not
// exports.getEnrolledCourses = async (req, res) => {
//   try {
//     // you put the id inside req. user.id
//     // you can not get the id from request body req.body or nahi req.body.id se  bcs aapne id vha pass hee nhi kee hai

//     // yha par me fas gya tha
//     const userId = req.user.id;
//     console.log("User id is !!! ", userId);
//     let userInfo = await User.findOne({ _id: userId })
//       .populate({
//         path: "courses",
//         populate: {
//           path: "courseContent",
//           populate: {
//             path: "subSection",
//           },
//         },
//       })
//       .exec();

//     console.log("get id from body,User detail of ", userInfo);

//     // convert  userInfo into object id
//     userInfo = userInfo.toObject();
//     var SubsectionLength = 0;
//     for (var i = 0; i < userInfo.courses.length; i++) {
//       let totalDurationInSeconds = 0;
//       SubsectionLength = 0;
//       for (var j = 0; j < userInfo.courses[i].courseContent.length; j++) {
//         totalDurationInSeconds += userInfo.courses[i].courseContent[
//           j
//         ].subSection.reduce(
//           (acc, curr) => acc + parseInt(curr.timeDuration),
//           0
//         );
//         userInfo.courses[i].totalDuration = convertSecondsToDuration(
//           totalDurationInSeconds
//         );
//         SubsectionLength +=
//           userInfo.courses[i].courseContent[j].subSection.length;
//       }
//       let courseProgressCount = await CourseProgress.findOne({
//         courseID: userInfo.courses[i]._id,
//         UserId: userId,
//       });
//       courseProgressCount = courseProgressCount?.completedVideos.length;
//       if (SubsectionLength === 0) {
//         userInfo.courses[i].progressPercentage = 100;
//       } else {
//         // To make it up to 2 decimal point
//         const multiplier = Math.pow(10, 2);
//         userInfo.courses[i].progressPercentage =
//           Math.round(
//             (courseProgressCount / SubsectionLength) * 100 * multiplier
//           ) / multiplier;
//       }
//     }

//     if (!userInfo) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find user with id: ${userDetails}`,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "User info along with Enrolled Courses",
//       data: userInfo.courses,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//       message:
//         "Error Occured while fetching enrolled courses details, Internal server Problem ",
//     });
//   }
// };

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("I am inside the enrolled courses controller");
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

      // console.log("USER id se uski sabhi details ",userDetails);

    userDetails = userDetails.toObject();

    var SubsectionLength = 0;
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0;
      SubsectionLength = 0;
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration),
          0
        );
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        );
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length;
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      });
      console.log("coursess progress count ",courseProgressCount);
      courseProgressCount = courseProgressCount?.completedVideos.length;
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier;
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    // console.log("courses ke andar hai ",userDetails.courses);
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.instructorDashboard = async (req, res) => {
  console.log("Inside Instructor Dashboard Controller");
  try {
    const userid = req.user.id;
    console.log("We got user id is", userid);
    // get all the details of the instructor
    const courseDetails = await Course.find({ instructor: userid });
    console.log("All the courseDetails is ", courseDetails);
    // validate the courseDetails

    const courseData = courseDetails.map((course) => {
      const totalStudentEnrolled = course.studentEnrolled.length;

      // toatl earning amount nikalne ke leaye course ke prize se total jitne student ne course buy keaya hai us se multiply karke nikal lenge
      const totalCourseAmountOfSellingCourse =
        totalStudentEnrolled * course.price;

      // create a new object with the additional feilds
      const courseDataStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentEnrolled,
        totalCourseAmountOfSellingCourse,
      };
      console.log("Course Stats",courseDataStats);
      return courseDataStats;
    });

    res.status(200).json({
      success: true,
      message: "All the Instructor courseData Stats are fetched successfully",
      courses: courseData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};
