const express = require("express") ;
const router = express.Router() ;
const User = require("../models/user.js");
const passport = require("passport");

//user - sign up
    router.get("/signup" ,(req,res) =>{
      res.render("listings/signup.ejs");
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
        res.redirect("/signup");
      }
      
    })

  //user - login

  router.get("/login",async(req,res) =>{
     res.render("listings/login.ejs");
  })


  router.post("/login",
   passport.authenticate('local', { failureRedirect: '/login' , failureFlash : true }),
      async(req,res) =>{
      req.flash("success","Welcome back to Wanderlust !");

  })


module.exports = router ;