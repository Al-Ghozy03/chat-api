const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
require("dotenv").config;

mongoose.connect(process.env.DB_URL);

const usermodel = mongoose.model("users", {
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  photo_profile: {
    type: String,
    default: null,
  },
  public_id: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
});

const tokenmodel = mongoose.model("tokens", {
  user_id: {
    type: ObjectId,
  },
  token: {
    type: String,
  },
});
const forgotpasswordmodel = mongoose.model("forgot_passwords", {
  user_id: {
    type: ObjectId,
  },
  token: {
    type: String,
  },
});

const friendmodel = mongoose.model("friends", {
  from: {
    type: ObjectId,
  },
  to: {
    type: ObjectId,
  },
  status: {
    type: String,
    enum: ["ask", "friend", "not-friend"],
    default: "not-friend",
  },
});
module.exports = { usermodel, tokenmodel, forgotpasswordmodel, friendmodel };
