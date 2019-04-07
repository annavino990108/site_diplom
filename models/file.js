const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  user:{
    type: String,
    required:true,
  },
  category:{
    type:String,
    required:true,
  },
  path:{
    type:String,
    required:true,
  }

});

module.exports = mongoose.model("File", schema);
