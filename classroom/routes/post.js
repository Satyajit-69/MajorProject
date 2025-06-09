const express = require("express");
const router= express.Router();

//the common path is "/users"


//index
router.get("/",(req,res) =>{
    res.send("Post root ")
})

//show
router.get("/:id",(req,res) =>{
    res.send("Get for Post id")
})

//post
router.post("/",(req,res) =>{
    res.send("hello there Post(post method) ")
})

//delete
router.delete("/:id",(req,res) =>{
    res.send("Delete for the post ") ;
})

//export
module.exports = router ;