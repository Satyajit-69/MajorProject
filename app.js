const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const Reviews = require("./models/review.js") ;
const listings = require("./routes/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const {listingSchema , reviewsSchema} = require("./schema.js");
const Listing = require("./models/listing.js");
// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/wonderlust", {})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));





//reviews validation
const validateReview = (req,res,next) =>{
let {error} = reviewsSchema.validate(req.body);
    if(error) {
      let errMsg = error.details[0].message;
      console.log(errMsg) ;
      throw new ExpressError(400,errMsg) ;
      }
      else {
      next() ;
    }
}



// Home Route
app.get("/root", (req, res) => {
  res.render("listings/home");
});

//set common path
app.use("/listings",listings);
 
//Reviews 
  //post
  app.post("/listings/:id/reviews" ,  validateReview ,wrapAsync ( async (req,res) =>{
      let listing = await Listing.findById(req.params.id) ;
      let newReview = new Reviews(req.body.review) ;

      listing.reviews.push(newReview) ;
      await newReview.save()  ;
      await listing.save() ;

      console.log("New review saved") ;
      res.redirect(`/listings/${listing.id}`) ;
  })) ;


  //delete
  app.delete("/listings/:id/reviews/:reviewId" ,wrapAsync (async(req,res) =>{
    let  {id , reviewId} = req.params  ;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}}) ;
    await Reviews.findByIdAndDelete(reviewId) ;
    console.log("review deleted") ;
    res.redirect(`/listings/${id}`) ;
  }));




//Page not found - 404
app.use((req, res) => {
  res.status(404).render("listings/error.ejs", { message: "Page Not Found" });
});



// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "something went wrong" ;
  res.status(status).render("listings/error.ejs", { message });
});



// Start Server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
