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

    // Call the listen method here, inside the connect callback
    const port = 8000;
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
    ],
  })
);

app.use(express.json());

// routes
app.use("/", require("./routes/users"));

// middleware for error responses
app.use(errors.errorHandler);

// Don't call listen here

// Call the connect method to initiate the connection
connect();
