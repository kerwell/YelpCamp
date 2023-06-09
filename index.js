const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressError = require('./utilities/ExpressError');
const path = require("path");
const catchAsync = require('./utilities/catchAsync');
const {campgroundSchema, reviewSchema} = require('./schemas.js')

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

const validateCampground = (req,res,next)=>{
    // const result = campgroundSchema.validate(req.body);
    const {error} = campgroundSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el => el.message).join()
      console.log(error); //this shows us our error details
      throw new ExpressError(msg, 400)
    }else {
      next();
    }
}

const validateReview = (req,res,next)=>{
  const {error} = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join()
    console.log(error); //this shows us our error details
    throw new ExpressError(msg, 400)
  }else {
    next();
  }
}

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

app.post("/campgrounds", validateCampground, catchAsync(async (req, res) => {
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

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground,});
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req,res)=>{
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  // await review.save();
  // await campground.save();
  await Promise.all([review.save(), campground.save()]);
  // mongoose way in making two promise await concurrently
  res.redirect(`/campgrounds/${campground._id}`);
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
