const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportlocalMongoose = require("passport-local-mongoose");

// DELETE the empty 'const User = new Schema({});' line.

const userSchema = new Schema ({
 // Passport-local-mongoose requires this field for the default strategy
 // to work correctly. It uses this field to check for uniqueness.
 username: { 
 type: String, 
 required: true, 
 unique: true 
 },
 email :{
 type : String ,
 required : true ,
 unique: true
 }
});

// The plugin adds methods for hashing/salting/checking the password.
userSchema.plugin(passportlocalMongoose);

module.exports = mongoose.model('User', userSchema);