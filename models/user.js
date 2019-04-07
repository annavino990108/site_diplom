const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  firstName:{
    type: String,
    required: true,
  },
  lastName:{
    type: String,
    required: true,
  },
  city:{
    type: String,
    required: true,
  },
  role:{
    type: String,
    required: true,
  },
  email:{
    type: String,
		required: true,
    unique:true
  },
  password:{
    type: String,
		required: true,
  },
  active:{
    type: Boolean,
    required: true,
  },
  secret_token:{
    type: String,
    required: true,
  },
}
);

module.exports = mongoose.model("User", schema);
