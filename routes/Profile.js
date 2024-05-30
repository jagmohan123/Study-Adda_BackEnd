const express = require("express");
const router = express.Router();
const {
  updateProfile,
  deleteAccouunt,
  getAllUser,
  updateProfileImage,
  getEnrolledCourses,
  instructorDashboard,
} = require("../controllers/Profile");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");
const {
  auth,
  isStudent,
  isInstructor,
  isAdmin,
} = require("../middlewares/auth");


router.put("/updateProfile", auth, updateProfile); //done
router.put("/updateProfileImage", auth, updateProfileImage); //done
// only student can delete account i am not allowd to delete instructor account

router.delete("/deleteProfile", auth, isStudent, deleteAccouunt); //done
router.get("/getUserDetails", auth, getAllUser); //done

router.get("/getEnrolledCourses", auth, getEnrolledCourses);



router.post("/resetPassword-token", resetPasswordToken); //done
router.post("/reset-password", resetPassword); //done

// InstructorStats of earning that means kitne course kitni earning vo sab es controller se aaega
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
