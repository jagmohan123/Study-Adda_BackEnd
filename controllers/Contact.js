const { contactEmail } = require("../mail/templates/contactEmail");
const mailSender = require("../utility/mailSender");
exports.ContactControoler = async (req, res) => {
  try {
    const { firstName, lastName, email, message, phone, countrycode } =
      req.body;
    console.log("body data ", req.body);
    if (!firstName || !email || !message || !countrycode || !phone) {
      return res.status(403).json({
        success: false,
        message: "All feilds are required ",
      });
    }
    const emailResponse = await mailSender(
      email,
      "Your Message sent successfully.",
      contactEmail(email, phone, firstName, lastName, message, countrycode)
    );
    console.log("Email response is ", emailResponse);
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Can not send mail, Something went wrong",
      error: error.message,
    });
  }
};
