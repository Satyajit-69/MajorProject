const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const cookieParser = require('cookie-parser');

app.use(cookieParser("secretcode"));

//common path
app.use("/users",users) ;
app.use("/posts",posts) ;

app.get("/getsignedcookies",(req,res) =>{
  res.cookie("made-In","India" ,{signed:true});
  res.send("signed cookies sent");
})

app.get("/verify",(req,res) =>{
   console.log(req.signedCookies) ;
   res.send("verified");
})

app.get("/getcookies",(req,res) =>{
  let {name = "Heisenberg"} = req.cookies ;
  res.send(`Hi,${name}`);
})


app.get("/",(req,res) =>{
  console.dir(req.cookies);
  res.send("root is here");
})

// Start Server
app.listen(8080, () => {
  console.log("Listening on port 8080");
});