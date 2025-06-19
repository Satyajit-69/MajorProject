const express = require("express") ;
const router = express.Router() ;
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl , isLoggedIn}= require("../middleware.js");
const userControllers = require("../controllers/user.js");




//user - sign up
    router.get("/signup" ,userControllers.renderSignUp);
    router.post("/signup", userControllers.signupUser);

  //user - login
  router.get("/login",userControllers.renderLogin);


//post login
router.post("/login",saveRedirectUrl,

  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userControllers.loginAuthentication);


//user log out
 router.get("/logout",userControllers.logoutUser);

module.exports = router ;