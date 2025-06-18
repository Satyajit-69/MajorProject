const mongoose = require("mongoose") ;
const Schema = mongoose.Schema ;
const Reviews = require("./review.js") ;
const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: { type: String },
    url: { type: String }
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", // This must match mongoose.model("Review", ...)
    }
  ],
  owner : {
    type : Schema.Types.ObjectId ,
    ref :"User" ,
  },
});

listingSchema.post("findOneAndDelete" , async (listing) =>{

    if(listing) {
    await Reviews.deleteMany({_id : {$in : listing.reviews}}) ;
    console.log("reviews also deleted") ;
    }
})

const Listing = mongoose.model("Listing",listingSchema) ;
module.exports = Listing ;