const Listing = require("../models/listing.js");

//index route
module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings });
};


//new route
module.exports.new = (req, res) => {
  res.render("listings/new");
};


//create listing
module.exports.createListing = async (req, res, next) => {
  if (!req.body.listing.image) req.body.listing.image = { url: "/default.avif" };
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id ;
  await newlisting.save();
  req.flash("success","new listing created") ;
  res.redirect("/listings");
};


//show route
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings"); // ✅ prevent further execution
  }

  res.render("listings/show", { listing });
};


//edit route
module.exports.editRoute = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/edit", { listing });
};


//update route
module.exports.updateRoute  = async (req, res, next) => {
  const { id } = req.params;
  let listingData = req.body.listing;
  // Fix: Wrap image as object if it's a string
  if (typeof listingData.image === "string") {  
    listingData.image = { url: listingData.image };
  }
  
  await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
  req.flash("success","listing updated") ;
  res.redirect(`/listings/${id}`);
};


//deleteRoute 
module.exports.deleteRoute =async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/edit", { listing });
};

