const express = require("express") ;
const router = express.Router() ;
const User = require("../models/user.js");
const passport = require("passport");




//islogged in middleware
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
}


//user - sign up
    router.get("/signup" ,(req,res) =>{
      res.render("listings/user/signup.ejs");
    })


    router.post("/signup", async (req,res) =>{
      try {
        let {username , email ,password} = req.body ;
        const newUser = new User({email,username}) ;
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        req.flash("success","Welcome to WanderLust");
        res.redirect("/listings");
      } catch (error) {
        req.flash("error",error.message) ;
        console.log(error) ;
        res.redirect("listings/user/signup");
      }
      
    })

  //user - login

  router.get("/login",async(req,res) =>{
     res.render("listings/user/login.ejs");
  })





  router.post("/login",
  passport.authenticate('local', 
    { failureRedirect: '/login' , failureFlash : true 
    }),
      async(req,res) =>{
      req.flash("success","welcome back to wonderlust ! You are logged in :)");
      res.redirect("/listings");
  })


  //user log out
 
 router.get("/logout", isLoggedIn ,(req,res,next) =>{
  req.logOut((err) => {
    if(err) {
    return next(err);
  }
  req.flash("success" ,"You are logged out ! :(");
  res.redirect("/listings");
  })
 
})

module.exports = router ;