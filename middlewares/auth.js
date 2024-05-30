const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// authentication
exports.auth = async (req, res, next) => {
  try {
    // spelling ka dyan rakhe authorization kee
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");

    // we get token from only header here
    console.log("token is ye hai  ", token);
    // if token is missing return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is not found ",
      });
    }

    // veryfying the token
    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      // put the decode payload in user
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token ",
      });
    }

    // goto the next middleware
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: " Something went wrong while verifying the token",
    });
  }
};

// isStudent

exports.isStudent = async (req, res, next) => {
  try {
    // we have to deal with db instead of getting accounttype from ewq.body
    const userDetails = await User.findOne({ email: req.user.email });
    // we fetch the user details and by this we can find account type
    if (userDetails.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is the protected route for the student ",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role can'nt be verified, please try again!!! ",
    });
  }
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
  const userDetails = await User.findOne({ email: req.user.email });
  // console.log("Is Instructor login", userDetails);
  try {
    if (userDetails.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is the protected route for the Instructor ",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Did not match the user roll  ",
    });
  }
};

// isAdmin

exports.isAdmin = async (req, res, next) => {
  const userDetails = await User.findOne({ email: req.user.email });

  try {
    if (userDetails.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is the protected route for the Admin ",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "This is the protected route for the Admin ",
    });
  }
};
