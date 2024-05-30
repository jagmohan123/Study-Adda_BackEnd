//send otp for otp verifiaction

const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const { passwordUpdate } = require("../mail/templates/passwordUpdate");
const mailSender = require("../utility/mailSender");
require("dotenv").config();

// signup
exports.signUp = async (req, res) => {
  try {
    // fecth the data
    const {
      firstName,
      lastName,
      email,
      password,
      confirm_password,
      accountType,
      contact,
      otp,
    } = req.body;
    // validate the data

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirm_password ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "please enter all the details ",
      });
    }

    // 2 password match
    if (password !== confirm_password) {
      return res.status(403).json({
        success: false,
        message:
          "Password and Confirm Password value not macth please try again ",
      });
    }

    // check user already exist or not
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(403).json({
        success: false,
        message: ` User already exist corresponding to this email id ${email}`,
      });
    }

    // find latest otp stored for the user jo sabse last me gya hai
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("Recent Otp value is ", recentOtp);

    // validate the otp have any value or not
    if (recentOtp.length === 0) {
      return res.status(404).json({
        success: false,
        message: "OTP has not found, Please resend the OTP !!!",
      });
    }

    // macth the opt generated and store otp in db
    if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "OTP miss macth , please enter valid otp",
      });
    }

    if (email !== recentOtp[0].email) {
      return res.status(400).json({
        success: false,
        message: "Email Id miss macth , please enter valid email Id",
      });
    }

    // if macthes  the otp hash the password and
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
    // create the user
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    // for save entry in additionalDetails we have to create the profile

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contact: null,
    });
    // Create the user account
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      accountType: accountType,
      contact,
      approved: approved,
      additionalDetails: profileDetails._id,
      //   create the avatar image on the basis of firstName and lastName
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    console.log("userCreated feild containt the data ", user);

    // successful response
    return res.status(201).json({
      success: true,
      message: "User Account created successfully ",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User can not be reagister, Please try again",
      error: error.message,
    });
  }
};

// send the otp for email verification first
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: `Email id is required`,
      });
    }
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(401).json({
        success: false,
        message: ` User already exist corresponding to this email id ${email}`,
      });
    }

    
    var otp = otpGenerator.generate(6, {
      // i need only no. no need below things thats why we set false in everywhere
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Otp generated successfully", otp);
    // generated otp should be unique so check generater

    const result = await OTP.findOne({ otp: otp });
   
    console.log("Generated otp is =>", otp);
    console.log("result is=>", result);

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      // think about the below line
      result = await OTP.findOne({ otp: otp });
    }

    // if otp generate successfully save details in OTP model
    const otpPayload = { email, otp };

    // create an entry in db in DB
    const otpEntry = await OTP.create(otpPayload);

    console.log("Created otp stored in db is =>", otpEntry);

    // return the response
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.log("Yha fat gya hai, So Come into in the auth controllers!!!", error.message);
    return res.status(500).json({
      success: false,
      message: "OTP can't sent, Internal Server Problem",
      error: error.message,
    });
  }
};

// login

exports.Login = async (req, res) => {
  try {
    // fecth the data
    const { email, password } = req.body;

    // validate the data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Email and Password both feilds are required ",
      });
    }

    // check the user exist related to given email
    let user = await User.findOne({ email })
      .populate("additionalDetails")
      .exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `No Account found corresponding to given email id ${email}`,
      });
    }

    // if user exist match the password
    if (await bcrypt.compare(password, user.password)) {


      let token = jwt.sign(
        { email: user.email, id: user._id, accountType: user.accountType },

        process.env.JWT_SECRET,
        {
          expiresIn: "30h",
        }
      );



      // before give the response we make sure we have to
      //  set the password undefined so user can not view the password in response
      user = user.toObject();
      user.token = token;
      user.password = undefined;

      let options = {
        // cookie expires in 3 days
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      // we also make cookie as a response
      res.cookie("token", token, options).status(200).json({
        success: true,
        message: `Login Successfully`,
        token,
        user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: `Password is incorrect, Please try again later`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "User can not login please try again later, Internal Server Problem",
      error: error.message,
    });
  }
};

// change Password
exports.changePassword = async (req, res) => {
  try {
    // find the user by id so that we can update the password from the profile
    const userInfo = await User.findById(req.user.id);
    console.log("User found or not", userInfo);
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    // get the old password, newpassword, confirm_password from the body
    const { oldPassword, newPassword } = req.body;
    console.log("Value of oldpassword ", oldPassword);
    console.log("Value of new Password ", newPassword);

    if (!(await bcrypt.compare(oldPassword, userInfo.password))) {
      return res.status(403).json({
        success: false,
        message: "Please Enter Correct Current Password !!",
      });
    }

    // hash the new password
    let hashNewPassword;
    try {
      hashNewPassword = await bcrypt.hash(newPassword, 10);
    } catch (error) {
      res.status(403).json({
        success: false,
        message: "Error occured while hashing the new password",
      });
    }

    // now update the password in user schema so we have to update the user schema
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { password: hashNewPassword },
      { new: true }
    );

    // send the password update notification email
    try {
      const emailResponse = await mailSender(
        updatedUser.email,
        " Password for your account has been updated ",
        passwordUpdate(
          updatedUser.email,
          `Password updated successfully for
       ${updatedUser.firstName}${updatedUser.lastName}`
        )
      );
      console.log("email response of update password is =>", emailResponse);
    } catch (error) {
      console.log("error of password change =>", error);
      return res.status(500).json({
        success: false,
        message:
          "Error occured while sending email for updating password the password",
        error: error.message,
      });
    }

    // at the end return the successful response
    res.status(201).json({
      success: true,
      message: "Password Updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error occured while changing the password, Internal server problem ",
      error: error.message,
    });
  }
};
