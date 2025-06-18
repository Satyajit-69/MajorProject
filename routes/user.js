const express = require("express") ;
const router = express.Router() ;
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl , isLoggedIn}= require("../middleware.js");





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
        //login the signed user
            req.login(registeredUser,(err) =>{
              if(err){
                return next(err) ;
              }
            req.flash("success","Welcome to WanderLust");
            res.redirect("/listings");
            })
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


//post login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
  }
);


//user log out
 router.get("/logout",(req,res,next) =>{
  req.logOut((err) => {
    if(err) {
    return next(err);
  }
  req.flash("success" ,"You are logged out ! :(");
  res.redirect("/listings");
  })
 
})

module.exports = router ;