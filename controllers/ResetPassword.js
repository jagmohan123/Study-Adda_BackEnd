const User = require("../models/User");
const mailSender = require("../utility/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { passwordUpdate } = require("../mail/templates/passwordUpdate");
//resetPassword Token send mail
exports.resetPasswordToken = async (req, res) => {
  try {
    // fetch the email from body
    const { email } = req.body;

    // check user is exist for this email id

    const isUserExist = await User.findOne({ email: email });
    if (!isUserExist) {
      return res.status(403).json({
        success: false,
        message: `Your email ${email} is not registered with us `,
      });
    }

   
    const token = crypto.randomBytes(20).toString("hex");

    // update user by adding token and expiresTime
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        // token expires with in 5min
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );
    console.log(updatedDetails);
    // create the url for frent-end
    const url = `http://localhost:3000/update-password/${token}`;

    //send main containg the url
    await mailSender(
      email,
      "Password Reset Link ",
      `Password Reset Link, Click here ${url}`
    );

    // return the response
    res.status(200).json({
      success: true,
      message: "Reset Password Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error occured while sending the reset Password link ",
    });
  }
};

// Reset Password

exports.resetPassword = async (req, res) => {
  try {
    // fetch the data/ we'll get 3 things
    // frontend put the token in body
    const { password, confirm_password, token } = req.body;
    // validation
    if (confirm_password !== password) {
      return res.status(403).json({
        success: false,
        message: "Password and confirm_Password value not match ",
      });
    }
    // find the user details from the db
    const userDetails = await User.findOne({ token: token });
    console.log("Given user by given token", userDetails);

    if (!userDetails) {
      return res.status(403).json({
        success: false,
        message: `Token is invalid, Please regenerate the Reset Password link  `,
      });
    }

    // check the token time agar token kee validity end ho gai ho tab
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: `Token has expired, Please regenerate it.} `,
      });
    }
    console.log("user email is ==>", userDetails.email);
    // if every thing ok now hash the password
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error occured while hashing the password ",
        error: error.message,
      });
    }

    // update the password
    const use = await User.findOneAndUpdate(
      { token: token },
      { password: hashPassword },
      { new: true }
    );
    console.log("upadetd user is", use);

    // create the url for frent-end
    const url = `http://localhost:3000/login`;
    // console.log("user upfate=>>>>", use.email);
    await mailSender(
      `${use.email}`,
      "Password Reset Successfully",
      passwordUpdate(use.email, userDetails.firstName, url)
    );
    // return the response
    res.status(200).json({
      success: true,
      message: " Password Reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: " Error occured while reseting Password  hjgdjasg. ",
    });
  }
};
