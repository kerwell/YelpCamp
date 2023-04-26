const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});