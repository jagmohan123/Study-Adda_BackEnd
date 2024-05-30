const express = require("express");
const app = express();
require("dotenv").config();
const ContactRoutes = require("./routes/Contact");
const UserRoute = require("./routes/User");
const PaymentRoute = require("./routes/Payment");
const ProfileRoute = require("./routes/Profile");
const CourseRoute = require("./routes/Course");
const fileUploader = require("express-fileupload");

const getDbConnect = require("./config/database");
const getCloudinaryConnect = require("./config/cloudinary");
const cookieParser = require("cookie-parser");
var cors = require("cors");
const PORT = process.env.PORT || 4000;
// database connectivity
getDbConnect();
// middlewares
app.use(express.json());
app.use(cookieParser());
// most imp whatever request come from localhost3000 from front end us request ko entertaint karna imp hai
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  fileUploader({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// connect with cloudinary
getCloudinaryConnect();

// mount our api route
app.use("/api/v1/connect",ContactRoutes);
app.use("/api/v1/auth", UserRoute);
app.use("/api/v1/profile", ProfileRoute);
app.use("/api/v1/course", CourseRoute);
app.use("/api/v1/payment", PaymentRoute);

// default route
app.get("/", (req, res) => {
  // res.send("<h4>This is a Home page </h4>");
  return res.status(200).json({
    success: true,
    message: "Your server is up and running ",
  });
});

app.listen(PORT, () => {
  console.log(`Server starting at ${PORT}`);
});
