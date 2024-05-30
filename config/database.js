const mongoose = require("mongoose");
require("dotenv").config();
function getDbConnect() {
  mongoose
    .connect(process.env.DATABASE_URL, {
      // useNewUrlParser: true,
      //   useUnifiedTopology:true,
    })
    .then(() => {
      console.log("Database Connection Done");
    })
    .catch((e) => {
      console.log(e);
      console.log(e.message);
      console.error("following error occured", e);
      process.exit(1);
    });
}
module.exports = getDbConnect;
