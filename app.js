if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/user");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

const app = express();


// ---------------- MongoDB ----------------
mongoose.connect(process.env.ATLASDB_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));


// ---------------- View Engine ----------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ---------------- Middleware ----------------
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// ---------------- Session ----------------
const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
});

app.use(session({
  store,
  secret: process.env.SECRET || "secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());


// ---------------- Passport ----------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ---------------- Flash + Current User ----------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// ---------------- Routes ----------------
app.get("/", (req, res) => {
  res.render("listings/home");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// ---------------- 404 ----------------
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


// ---------------- Error Handler ----------------
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  res.status(status).render("listings/error", { message });
});


// ---------------- Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
