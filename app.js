const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const session = require("express-session");
const flash = require("connect-flash");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/wonderlust", {})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//sessions 

  const sessionOptions = {secret : "mysuperSecretCode",
                          resave : false ,
                          saveUninitialized : true ,
                          cookie : {
                            expires:Date.now()  + 7 * 24 * 60 * 60 * 1000 ,
                            maxAge :  7 * 24 * 60 * 60 * 1000 ,
                            httpOnly : true ,
                          },
                        }

  app.use(session(sessionOptions)) ;
  app.use(flash());
  app.use((req,res,next) =>{
    res.locals.success = req.flash("success") ; 
    next();
  })

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));





// Home Route
app.get("/root", (req, res) => {
  res.render("listings/home");
});

//set common path
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

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
