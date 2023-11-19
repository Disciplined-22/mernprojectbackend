require("dotenv").config();
const express = require("express");
const app = express();
require("./DB/db");
const cors = require("cors");
const router = require("./Routes/router");
const PORT = process.env.PORT || 8000;

// Use cors middleware with specific configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // Update with your frontend URL in production
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static("./uploads"));
app.use("/files", express.static("./public/files"));

app.use(router);

app.listen(PORT, () => {
  console.log(`Server start at port no ${PORT}`);
});
