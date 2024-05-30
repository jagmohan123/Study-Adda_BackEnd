const express = require("express");
const router = express.Router();

// specific Instructor courses
const { getInstructorCourses } = require("../controllers/Course");

// Course Controllers
const {
  createCourse,
  editCourse,
  deleteCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
} = require("../controllers/Course");

const { updateCourseProgress } = require("../controllers/CourseProgress");

// category controllers
const {
  createCategory,
  getAllCategory,
  categoryPageDetails,
} = require("../controllers/Category");

// Section Controllers
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

// SubSection
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/SubSection");

// Rating and Reviews
const {
  createRatingAndReview,
  getAverageRating,
  getAllRatingsAndReviews,
} = require("../controllers/RatingAndReview");

const {
  auth,
  isStudent,
  isInstructor,
  isAdmin,
} = require("../middlewares/auth");

//!!!!!!!!!!!!!!!!!!!!!!!! Courses only created by Instructor  !!!!!!!!!!!!!!!!!!!!!!!!!

// only instructor can create the course edit and delete
router.post("/createCourse", auth, isInstructor, createCourse); //done
router.post("/editCourse", auth, isInstructor, editCourse); //done
router.post("/deleteCourse", auth, isInstructor, deleteCourse); //done
//!!!!!!!!!!!!!!!!!!!!!!!! Section created by Instructo  !!!!!!!!!!!!!!!!!!!!!!!!!

// only instructor can create, update and delete the section of the course
router.post("/addSection", auth, isInstructor, createSection); //done
router.post("/updateSection", auth, isInstructor, updateSection); //done
router.post("/deleteSection", auth, isInstructor, deleteSection); //done

//!!!!!!!!!!!!!!!!!!!!!!!! SubSection created by Instructo  !!!!!!!!!!!!!!!!!!!!!!!!!

// only instructor can add,update and delete the subsection of the course
router.post("/addSubSection", auth, isInstructor, createSubSection); //done
router.post("/updateSubSection", auth, isInstructor, updateSubSection); //done
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection); //done

// getAll Register Course
router.get("/getAllCourse", getAllCourses); //done
router.post("/getCourseDetails", getCourseDetails); //done 
router.post("/getFullCourseDetails", auth, getFullCourseDetails);

//!!!!!!!!!!!!!!!!!!!!!!!! Category  only created by admin !!!!!!!!!!!!!!!!!!!!!!!!!

// Only admin can make the category
router.post("/createCategory", auth, isAdmin, createCategory); //done
// show all the category
router.get("/showAllCategory", getAllCategory); //done
// show all the categories courses or details
router.post("/getCategoryPageDetails", categoryPageDetails);

// !!!!!!!!!!!!!!!!!!!Reviews and Ratings  !!!!!!!!!!!!!!!!!!!!!!!!!
// only student can rate and review the course
router.post("/createRating", auth, isStudent, createRatingAndReview);
// show average Rating alongs with review and rating in home page  and course page also
router.get("/getAverageRating", getAverageRating);
// show all the rating and reviews in home page
router.get("/getReviews", getAllRatingsAndReviews);

// get all the courses of particular instrucor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);

// Student study and watch the video by this we track course progress
// change the progress of course so course is only stydy by student
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);




module.exports = router;
