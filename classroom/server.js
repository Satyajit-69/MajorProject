const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
//common path
app.use("/users",users) ;
app.use("/posts",posts) ;

// Start Server
app.listen(8080, () => {
  console.log("Listening on port 8080");
});