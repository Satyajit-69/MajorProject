const express = require("express") ;
const app = express() ;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js") ;
const method = require("method-override");
const path = require("path") ;
const ejsMate = require("ejs-mate");

//database connection
    const mongo_url = 'mongodb://127.0.0.1:27017/wonderlust' ;

        main()
            .then(() =>{
                console.log("connected to the database");
            })
            .catch((err) =>{
                console.log(err) ;
            })

        async function main() {
                await mongoose.connect(mongo_url) ;
            }

            
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(method('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")) ;
app.use(express.static(path.join(__dirname,"/public")))



//routes
app.get("/" , (req,res) =>{
    res.send("Hi ! I am root") ;
})

// app.get("/testListing" , async(req,res) =>{
//     let sample = new Listing ( {
//         title : "New Banglo",
//         description : "By the beach" ,
//         price : 120 ,
//         location : "Kolkata , West Bengal" ,
//         country : "India"
//         })

//     await sample.save();
//     console.log("sample was saved");
//     res.send("successful testing") ;

// })


//index route

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

//New route
app.get("/listings/new" ,   (req,res) =>{
      res.render("listings/new.ejs") ;
})


//show route
app.get("/listings/:id" , async( req ,res ) => {
    let  { id } = req.params ;
    const listing = await Listing.findById(id) ;

    res.render("listings/show.ejs" ,{ listing } ) ;
})

//add route
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});



//Edit route 
app.get("/listings/:id/edit" , async(req,res) => {
     const {id} = req.params ;
     const listing =  await Listing.findById(id) ;
     res.render("listings/edit.ejs" ,{listing}) ;
})

//update route
app.put("/listings/:id" ,async (req,res) =>{
      let {id} = req.params ;
      await  Listing.findByIdAndUpdate(id,{...req.body.listing})
      res.redirect(`/listings/${id}`);
})

//delete route
app.delete("/listings/:id" , async(req,res) =>{
       let {id} = req.params ;
      let deleted = await  Listing.findByIdAndDelete(id) ;
      console.log(deleted);
      res.redirect("/listings");
      
})

app.listen(3000,() =>{
  console.log("listening on port 3000");
})