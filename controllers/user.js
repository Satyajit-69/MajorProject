
const passport = require("passport");

//sign ups

module.exports.renderSignUp = (req,res) =>{
      res.render("listings/user/signup.ejs");
    };

module.exports.signupUser =  async (req,res) =>{
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
      
    };


//login 
module.exports.renderLogin = async(req,res) =>{
     res.render("listings/user/login.ejs");
  };



module.exports.loginAuthentication = 
 
  (req, res) => {
    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
  };




  //log out
  module.exports.logoutUser = (req,res,next) =>{
  req.logOut((err) => {
    if(err) {
    return next(err);
  }
  req.flash("success" ,"You are logged out ! :(");
  res.redirect("/listings");
  })
 
};