const mongoose = require("mongoose");
const DB = process.env.DB 

mongoose
  .connect(DB)
  .then(() => console.log("Database connected"))
  .catch((error) => console.log(error));
