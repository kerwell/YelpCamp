const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require("./models/campground");
const ExpressError = require('./utilities/ExpressError');
const path = require("path");
const catchAsync = require('./utilities/catchAsync');
const Joi = require('joi');

const app = express();

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
}));

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", catchAsync(async (req, res) => {
  // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400)
  const campgroundSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      image: Joi.string().require(),
      location: Joi.string().require(),
      description: Joi.string().required()
    }).required()
  })
  // const result = campgroundSchema.validate(req.body);
  const {error} = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join()
    throw new ExpressError(msg, 400)
  }
  console.log(result); //this shows us our error details
  const newCampground = new Campground(req.body.campground);
  await newCampground.save();
  res.redirect(`campgrounds/${newCampground._id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground,});
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req,res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  }));

app.all('*',(req,res,next)=>{
  next(new ExpressError('Page Not Found...', 404))
})

app.use((err,req, res, next)=>{
  const {statusCode = 500 } = err;
  if(!err.message) err.message = "Oh No, Something Went Wrong"
  res.status(statusCode).render('error',{err})
})

app.listen(4000, () => {
  console.log("Serving on port 4000");
});
