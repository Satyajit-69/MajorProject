const express = require("express");
const router= express.Router();

//index
router.get("/",(req,res) =>{
    res.send("hello there ! root ")
})

//show
router.get("/:id",(req,res) =>{
    res.send("Get for user id")
})

//post
router.post("/",(req,res) =>{
    res.send("hello there ! post ")
})

//delete
router.delete("/:id",(req,res) =>{
    res.send("Delete for user id") ;
})

//export
module.exports = router ;