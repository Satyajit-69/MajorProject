const mongoose = require("mongoose") ;
const Schema = mongoose.Schema ;
const Reviews = require("./review.js") ;
const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: {
    filename: { type: String },
    url: { type: String }
  },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  country: { type: String, required: true },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

listingSchema.post("findOneAndDelete" , async (listing) =>{

    if(listing) {
    await Reviews.deleteMany({_id : {$in : listing.reviews}}) ;
    console.log("reviews also deleted") ;
    }
})

const Listing = mongoose.model("Listing",listingSchema) ;
module.exports = Listing ;