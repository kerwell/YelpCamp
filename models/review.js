const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
});

// module.exports = mongoose.model('Review', reviewSchema)

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;