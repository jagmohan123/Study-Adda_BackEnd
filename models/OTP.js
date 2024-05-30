const mongoose = require("mongoose");
const mailSender = require("../utility/mailSender");
const  emailTemp = require("../mail/templates/emailVerification");
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
  },

  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    // otp will expire within 5 min
    expires: 60 * 5,
  },
});

// send mail functionality here call the sendMail function which is define  in utility folder

// below function need email and otp that means kisko email send karna hai and kya otp denge so verify kar ske
async function sendVerificationMail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemp(otp),

    );

    console.log("Mail send successfully", mailResponse);
  } catch (error) {
    console.log("Error occured while sending email Yha fas gya ");
    throw error;
  }
}

/* pre middleware use  above code run before saving the entry in const {propertyName} = objectToDestruct;
 you can not pass doc as a parameter here bcs we did not save the entry in DB or doc entry save hone ke bad milta hai 
 we donot have doc bcs pre middleware we can use next as a parameter here 

 If you call `next()` with an argument, that argument is assumed to be
 an error.*/

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationMail(this.email, this.otp);
  }
  // than go to next  middleware
  next();
});
module.exports = mongoose.model("OTP", otpSchema);
