const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const convertSecondsToDuration = require("../utility/SecToTimeDuration");
const uploadImageThumbnail = require("../utility/uploadImageThumbnail");
const { json } = require("express");

// create the course

exports.createCourse = async (req, res) => {
  // step-3 check for instructor at the course creation we need instructor id so insructor can make the course
  const userId = req.user.id;
  console.log("Your user id is ", userId);
  try {
    //step-1 fetch the course data from the body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;
    // get the image thumbnail from req.files
    // thumbnail is the key in post when you uplaod the data from the postman form data
    const thumbnailImage = req.files.thumbnail;

    // console.log("thumbnail", thumbnailImage);

    console.log("Tag is =>", _tag);
    console.log("Instrction is =>", _instructions);

    const tag = _tag.toString(_tag);
    // JSON.parse(tag);// it break the code give error

    const instructions = _instructions.toString(_instructions);
    // JSON.parse(_instructions);// it break the code give error

    // Convert the tag and instructions from string field Array to Array'
    // step-2 validate the data
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnailImage ||
      !category ||
      !instructions.length
    ) {
      return res.status(403).json({
        success: false,
        message: "All feilds are required for the creation  of course ",
      });
    }

    if (!status || status === undefined) {
      status = "Draft";
    }

    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });
    console.log("Instructor details ", instructorDetails);

    //step-4 Validate the instructor details
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details are not found ",
      });
    }

    // course model ke andar tag ek id hai
    const categoryDetails = await Category.findById(category);
    //step-5 veryfy the tag details
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "category details are not found ",
      });
    }

    //step-6 upload img to cloudinary

    const uplaodImage = await uploadImageThumbnail(
      thumbnailImage,
      process.env.FOLDER_NAME
    );
    console.log("Uploading image contain this data =>", uplaodImage);

    //step-7 if all things are good so we create a course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,

      thumbnail: uplaodImage.secure_url,
      status: status,
      instructions,
    });

    //step-9 add the new course to the user schema of instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          // courses array ke andar we insert the newCourseID  in user schema course array
          courses: newCourse._id,
        },
      },
      {
        new: true,
      }
    );

    //step-10 H.W DONE=>update the tag schema
    console.log("######################################");
    const categoriesAllInfo = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          // Tag schema ke andar course ka array hai vha par bhe created course kee id dal do
          courses: newCourse._id,
        },
      },
      {
        new: true,
      }
    );
    // .populate("courses");

    console.log("categoris schema after updating ", categoriesAllInfo);
    // step-11 return the response
    res.status(201).json({
      success: true,
      data: newCourse,
      message: "Course Created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to create a course ,Internal server Issue",
    });
  }
};

// get all the courses

exports.getAllCourses = async (req, res) => {
  try {
    // when you fetch the courses so the course must have courseName,courseDescription,price,tag,whatyouwilllearn and instructor name
    const allCourses = await Course
      .find
      // { status: "Published" },
      // {
      //   courseName: true,
      //   // courseDescription: true,
      //   instructor: true,
      //   price: true,
      //   thumbnail: true,
      //   ratingAndReviews: true,
      //   studentEnrolled: true,
      // }
      ()
      .populate("instructor")
      .exec();

    res.status(200).json({
      success: true,
      AllCourses: allCourses,
      message: "All Courses are fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fatch all the courses, Internal server Issue",
    });
  }
};

//specific course all details getCourseDetails

// getAllDetailsOfCourse
exports.getCourseDetails = async (req, res) => {
  try {
    // need courseId so, courseId we get from the request body
    const { courseId } = req.body;
    // find the coursedetails and all the details not in objectId

    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec();

    // validate the course details
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Course details not found corresponding to this courseId ${courseId}`,
      });
    }

    // calulate the time duration of the files
    // 0 se initialize karna jaruri hai nhi to NON aaega
    let totalTimeDurationInSecond = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInseconds = parseInt(subSection.timeDuration);
        totalTimeDurationInSecond += timeDurationInseconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalTimeDurationInSecond);

    // return the response
    return res.status(200).json({
      success: true,
      message: "All the Details of the course are fetched ",
      data: { courseDetails, totalDuration },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to get all the details of the course, Internal server problem",
      error: error.message,
    });
  }
};

exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // get all the course details
    console.log(
      "course id of full course details of specific course is is=>>> ",
      courseId
    );
    console.log("user id is ", userId);
    console.log("Course id is ", courseId);
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    console.log(
      `Detalis of course corresponding to this courseId is ${courseId}`,
      courseDetails
    );

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("courseProgressCount : ", courseProgressCount);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    // createdAt-1 means jo sabse last me create hua hai vo sabse pahele aaega

    // all the instructorCourses along with instructor details
    // Return the instructor's courses
    console.log("All courses of instructor is ", instructorCourses);

    res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    console.log("This is course id", courseId);
    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // find the category so also delete the course from the category
    const categoryInfo = await Category.findById({ _id: course.category });
    console.log("This course belong to ", categoryInfo._id);
    console.log("category schema before course delete ", categoryInfo);

    // Unenroll students from the course
    const studentsEnrolled = course.studentEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    // update the category schema bcs vha par bhi course kee id hai so vha se course kee id delete kar denge
    const updateCat = await Category.findByIdAndUpdate(
      { _id: categoryInfo._id },
      {
        $pull: { courses: courseId },
      }
    ).exec();
    console.log("category schema after course delete ", updateCat);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    console.log("given course id is ", courseId);

    // updates me jo bhi data aaega jo ham body se postman se send kar rhe hai
    const updates = req.body;
    console.log("what we have get in updates", updates);
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnail;
      const thumbnailImage = await uploadImageThumbnail(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
