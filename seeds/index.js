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
      const price = Math.floor(Math.random()* 20) + 10;
      const newCamp = new Campground({
        // location: `${cities[random1000].city}, ${cities[random1000].state}`,
        location: `${sample(cities).city}, ${sample(cities).state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image: `https://picsum.photos/500/400`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere omnis asperiores sequi natus maxime incidunt sapiente! Tenetur cumque nemo aperiam ipsa tempore? Maxime eligendi consequuntur assumenda quis sequi quod veniam!',
        price
      });
      await newCamp.save();
    }
  };


seedDB().then(() => {
  mongoose.connection.close();
});