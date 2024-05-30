const express = require("express");
const router = express.Router()
const { Login, signUp, sendOtp, changePassword, } = require("../controllers/Auth");
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword");
const { auth } = require("../middlewares/auth");

// Login 
router.post("/login", Login);//done

// sign up
router.post("/signup", signUp);//done

// for verification otp
router.post("/sendotp", sendOtp);//done

// for update the password from profile
router.post("/changePassword", auth, changePassword);//done

// generating a reset password token 
router.post("/reset-password-token/", resetPasswordToken);//done

// reset user password after verification
router.post("/reset-password/", resetPassword);//done

module.exports = router;