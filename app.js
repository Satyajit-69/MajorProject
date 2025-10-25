if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");
const ExpressError = require("./utils/ExpressError.js");

// ------------------- MongoDB Connection -------------------
const dbUrl = process.env.ATLASDB_URL;

mongoose
  .connect(dbUrl, {
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 2000
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    if (err.message.includes("IP whitelist")) {
      console.log("\n👉 Please add your IP address to MongoDB Atlas whitelist:");
      console.log("1. Go to MongoDB Atlas dashboard");
      console.log("2. Click on Network Access");
      console.log("3. Click Add IP Address");
      console.log("4. Click Allow Access from Anywhere (or add your specific IP)\n");
    }
    process.exit(1);
  });

// ------------------- View Engine -------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------------- Session -------------------
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (err) => {
  console.log("❌ Error in Mongo session store:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ------------------- Passport -------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------- Middleware -------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ------------------- Routes -------------------
// Home Route (should be before other routes)
app.get("/", (req, res) => {
  res.render("listings/home");
});

app.get("/root", (req, res) => {
  res.render("listings/home");
});

// Mount routes in order from most specific to least specific
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/listings", listingsRouter);
app.use("/", userRouter);


// ------------------- 404 Handler -------------------
app.all("*", (req, res, next) => {
  if (req.path.includes('favicon.ico')) {
    return res.status(404).end();
  }
  next(new ExpressError(404, `Page Not Found - ${req.originalUrl}`));
});

// ------------------- Global Error Handler -------------------
app.use((err, req, res, next) => {
  if (err.status === 404 && req.path.includes('favicon.ico')) {
    return res.status(404).end(); // Silently handle favicon 404s
  }
  
  console.error("Error:", err);
  
  // Handle Multer errors
  if (err.name === 'MulterError') {
    err.status = 400;
    err.message = `Image upload error: ${err.message}`;
  }
  
  // Handle Cloudinary errors
  if (err.http_code) {
    err.status = err.http_code;
    err.message = `Cloudinary error: ${err.message}`;
  }
  
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  
  // Check if the request accepts HTML
  if (req.accepts('html')) {
    res.status(status).render("listings/error.ejs", { 
      message,
      status,
      error: process.env.NODE_ENV !== 'production' ? err : {}
    });
  } else {
    // For API requests, return JSON
    res.status(status).json({
      error: message,
      status
    });
  }
});

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
