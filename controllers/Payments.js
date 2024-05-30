const { instance } = require("../config/razorpayConfig");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const mailSender = require("../utility/mailSender");
const {
  courseEnrollmentEmial,
} = require("../mail/templates/courseEnrollmentEmial");
const { default: mongoose, Mongoose } = require("mongoose");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");

exports.capturePayment = async (req, res) => {
  // whatever course i need to buy so we need courses id thats why we use here
  const { courses } = req.body;
  console.log("coming courses are", courses);
  // jis user ko course buy karna hai us user ke userId bhi need hogi
  const userId = req.user.id;
  console.log("coming userid is", courses);

  // check courses is present or not
  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Please provide Course id",
    });
  }
  let totalAmount = 0;
  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);
      // if no course found so return the response
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `No course found curresponding to this  course_id ${course_id}`,
        });
      }
      // check user is aleready buy the course or not
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentEnrolled.includes(uid)) {
        return res.status(403).json({
          success: false,
          message: "User Already bought this course ",
        });
      }

      // if all thing is ok so calculate the total amount
      totalAmount += course.price;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  // so option ka use karke order create karte hai
  try {
    const paymentResponse = await instance.orders.create(options);
    res.json({ success: true, message: paymentResponse });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "can not create the order",
    });
  }
};

// ####THIS IS USED TO FOR VERIFY THE PAYMENT
// if payment success so we assign the course
exports.verifySignature = async (req, res) => {
  // yha mujhe orderId, paymentId and signature ka need hoga so we have to import it
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;

  console.log(
    "all the id's are",
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  // find all the courses
  const courses = req.body?.courses;
  // get the user id
  const userId = req.user.id;
  console.log("user id is ", userId);

  // validate all the above data should be required for buy the course
  // if anyone is not valid so payment is failed
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(500).json({
      success: false,
      message: "Payment Failed all data is required",
    });
  }

  // yha par koi logic nhi hai accrding to rezorpay method we do same thing
  let body = razorpay_order_id + "|" + razorpay_payment_id;

  // this is steps we have to follow
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  // match the signatures
  if (expectedSignature === razorpay_signature) {
    // enroll the student in course after signature of payment is made
    await enrollStudent(courses, userId, res);
    // return the response
    return res.status(200).json({
      success: true,
      message: "Payment Verified",
    });
  }
  return res.status(501).json({
    success: false,
    message: "Payment failed due to mismatch signature",
  });
};

// Enroll the student in courses
const enrollStudent = async (courses, userId, res) => {
  // es function se courses ke array me traverse karunaga and
  // courses ke modal ke andar enrollStudent ke array me userid ko dalunga and same user modal
  //  ke andar enrollCourses ka array hai usme courses kee id insert karunga

  // step1 validate data
  if (!courses || !userId) {
    return res.status(403).json({
      success: false,
      message: "Please provide courses id and userId",
    });
  }

  // st1p2 wo we have multiple course so har ek course me user ko enroll karna padega
  for (const courseId of courses) {
    try {
      // find the course and enroll the student
      const enrollCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        {
          $push: {
            studentEnrolled: userId,
          },
        },
        { new: true }
      );

      if (!enrollCourse) {
        return res.status(501).json({
          success: false,
          message: "Courses not found",
        });
      }
      console.log("Updated course: ", enrollCourse);

      const courseProg = await CourseProgress.create({
        courseId: courseId,
        UserId: userId,
        completedVideos: [],
      });

      console.log("courseProgress feild create and assign by 0 by default",courseProg);

      // find the student and add the enroll courses in courses array in user modal
      // student course jaise hee buy karega us time course ki progress 0 hogi
      const enrollStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProg._id,
          },
        },
        { new: true }
      );

      console.log("Enroll student is ", enrollStudent);
      // step 3 send the mail to the user for buy the course successfully

      const emailResponse = await mailSender(
        enrollStudent.email,
        `Successfully into ${enrollCourse.courseName}`,
        courseEnrollmentEmial(
          enrollCourse.courseName,
          `${enrollStudent.firstName} ${enrollStudent.lastName}`
        )
      );
      console.log("Email sent successfully: ", emailResponse.response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server issue",
      });
    }
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  // 3no ko body se send kar dunga
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;
  if (!userId || !orderId || !paymentId || !amount) {
    return res.status(403).json({
      success: false,
      message:
        "all details are required such as userId, paymentId, orderId and amount",
    });
  }

  // send the successful but first get the user first by which you get the email and firstName and lastName of the user

  try {
    // enroll student
    const userDetails = await User.findById(userId);
    console.log("Enrolled User Details are", userDetails.email);
    await mailSender(
      userDetails.email,
      `Payment Received `,
      paymentSuccessEmail(
        `${userDetails.firstName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("Error sending email");
    res.status(500).json({
      success: false,
      message: "Could not send email, Internal server issue",
    });
  }
};

// send the successful email after buy the course

// #THIS IS FOR BUY THE SINGLE COURSE
// capture the payment and initiate the payment order
// exports.capturePayment = async (req, res) => {
//   // courseid by this we get all info of course and also userid by this we get all info of user
//   //   fetch the data
//   const { courses } = req.body;
//   const userId = req.user.id;
//   //   validate the data
//   if (courses.length === 0) {
//     return res.status(403).json({
//       success: false,
//       message: "Valid course id is required  ",
//     });
//   }

//   let totalAmount = 0;
//   for (const courseId of courses) {
//     let courseDetails;
//     try {
//       courseDetails = await Course.findById({ courseId });
//       // validate the courseDetails
//       if (!courseDetails) {
//         return res.status(403).json({
//           success: false,
//           message: " valid course details Not found",
//         });
//       }

//       // check user is already buy a course  if bought course return response
//       // our database me user id object type kee hai but request body se id string type me aa rha hai
//       // convert it into object type
//       const uid = new mongoose.Types.ObjectId(userId);
//       if (courseDetails.studentEnrolled.includes(uid)) {
//         return res.success(400).json({
//           success: false,
//           message: "Student already enrolled this course ",
//         });
//       }

//       // create order/ initiate the capture payment

//       totalAmount += courseDetails.price;
//     }
//     catch (error) {
//       console.log(error)
//       return res.status(500).json(
//         {
//           success: false,
//           message: error.message
//         })
//     }
//     // razorpay need *100 if your course price is 1000 so in rozorpay amount
//     // 100000
//     const options = {
//       amount: totalAmount * 100,
//       currency: "INR",
//       receiptNo: Math.random() * Date.now().toString(),
//       notes: {
//         // verify signature ke time me use karenge
//         courseId,
//         userId,
//       },
//     };

//     // create the order by below function
//     try {
//       const paymentResponse = await instance.orders.create(options);
//       console.log("payment Response ", paymentResponse);
//       //   return the response
//       return res.status(200).json({
//         success: true,
//         courseName: courseDetails.courseName,
//         courseDescription: courseDetails.courseDescription,
//         courseId: courseDetails._id,
//         thumbnail: courseDetails.thumbnail,
//         orderId: paymentResponse.id,
//         currency: paymentResponse.currency,
//         amount: paymentResponse.amount,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(403).json({
//         success: false,
//         message: "Could not initiate the order ",
//       });

//     }
//   }
// }
// // verify signature

// exports.verifySignature = async (req, res) => {
//   // this is our webhook secret which is used to verify the signature which is come from razorpay payment

//   const webhookSecret = "12345678"; //this is our signature
//   // razorpay signature come from header in the form of headers["x-razorpay-signature"]
//   const signature = req.headers["x-razorpay-signature"]; //razorpay signature

//   /*hashing is a technique which convert our data in encrypted or secure form which we cannot decrypt that data
//    hmac this means hashed based message authentication and 2nd hash algo is sha secure hasing
//    algo. hmac need to parameter 1st is hasing algorithm and 2nd is
//    secret_key kiske basis me data ko hash kare
//    here we are using sha256 hasing also */

//   const shasum = crypto.createHmac("sha256", webhookSecret); //step 1 create the hmac object
//   shasum.update(JSON.stringify(req.body)); // convert the hmac object in string formate
//   // whenever you run the hasing algo. on some text and jo bhi output aata hai us o/p ko
//   //    special test case me darsane ke leaye we use word "disgest" digest hexadecimal formate me hota hai
//   const digest = shasum.digest("hex");

//   //   than match the digest and our signature if both match so payment is authorized
//   if (digest === signature) {
//     console.log("payment Authorized");
//     // get the userid and courseid from notes we defined above
//     const { courseId, userId } = req.body.payload.payment.entity.notes;
//     try {
//       // take the action after payment done enroll the student in course
//       const enrollCourse = await Course.findOneAndUpdate(
//         { _id: courseId },
//         {
//           $push: {
//             studentEnrolled: userId,
//           },
//         },
//         { new: true }
//       );

//       //   check courseFound or not
//       if (!enrollCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course not found",
//         });
//       }

//       //   every thing ok so !!
//       console.log(enrollCourse);
//       //   find the student and add the course in user schema
//       // courses array me dal do student id ko
//       const enrollUser = await User.findOneAndUpdate(
//         { _id: userId },
//         {
//           $push: {
//             courses: courseId,
//           },
//         },
//         { new: true }
//       );
//       console.log("enroll student", enrollUser);
//       //   after enroll the course we have to sent the email to the user
//       // You successfully enrolled to the course
//       const emailSend = mailSender(
//         enrollUser.email,
//         "Congratualation from Study Adda ",
//         "Congratualation you are enrolled to the new course "
//       );

//       console.log(emailSend);
//       // return response
//       res.status(200).json({
//         success: true,
//         message: "Course Added successfully",
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   } else {
//     res.status(500).json({
//       success: false,
//       message: "Signature not matched",
//     });
//   }
// };
