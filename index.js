const express = require("express");
const mongoose = require("mongoose");
const auth = require("./middlewares/auth.js");
const errors = require("./middlewares/errors.js");
const { unless } = require("express-unless");
const dotenv = require("dotenv");

const app = express();
dotenv.config();

// connectDB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongoose");

    // Start listening for requests only after successful database connection
    const port = process.env.PORT || 8000;
    app.listen(port, "0.0.0.0", () => {
      console.log(`Veegil Bank API Connected on port ${port}...`);
    });
  } catch (error) {
    console.log("Cannot connect to Mongoose");
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("Database Disconnected");
});

// middlewares
auth.authenticateToken.unless = unless;
app.use(
  auth.authenticateToken.unless({
    path: [
      { url: "/auth/login", methods: ["POST"] },
      { url: "/auth/signup", methods: ["POST"] },
      // { url: "/auth/otpLogin", methods: ["POST"] },
      // { url: "/auth/verifyOTP", methods: ["POST"] },
    ],
  })
);

app.use(express.json());

// routes
app.use("/", require("./routes/users"));

// middleware for error responses
app.use(errors.errorHandler);

// Call connect function to initiate the database connection
connect();
