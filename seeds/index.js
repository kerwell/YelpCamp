const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };
  
  const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
      const newCamp = new Campground({
        location: `${sample(cities).city}, ${sample(cities).state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
      });
      await newCamp.save();
    }
  };


seedDB().then(() => {
  mongoose.connection.close();
});