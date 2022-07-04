const {
  usermodel,
  tokenmodel,
  forgotpasswordmodel,
} = require("../model/model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { default: jwtDecode } = require("jwt-decode");
const { sendEmail } = require("../mail/mail");
const { ObjectId } = require("mongodb");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_API_KEY,
});

async function isOnline(id) {
  await usermodel.updateOne({ _id: id }, { $set: { status: "online" } });
}
async function isOffline(id) {
  await usermodel.updateOne({ _id: id }, { $set: { status: "offline" } });
}

async function profile(req, res) {
  try {
    const { id } = req.params
    const data = await usermodel.findById(
      {
        _id: id,
      },
      { name: 1, email: 1, photo_profile: 1, bio: 1, status: 1 }
    );
    return res.json({ data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function showUserOnline(req, res) {
  try {
    const data = await usermodel.find(
      {
        $and: [
          { _id: { $ne: ObjectId(jwtDecode(req.headers.authorization).id) } },
          { status: "online" },
        ],
      },
      { name: 1, email: 1, photo_profile: 1, status: 1 }
    );
    return res.json({ data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function resetPassword(req, res) {
  try {
    let body = req.body;
    const data = await usermodel.findOne({ email: body.email });
    if (!data) return res.status(404).json({ message: "user's not found" });
    body.password = bcrypt.hashSync(body.password, 10);
    await usermodel.updateOne(
      { _id: data._id },
      { $set: { password: body.password } }
    );
    return res.status(200).json({ message: "success to change password" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function verifyForgotPassword(req, res) {
  try {
    const { email } = req.params;
    const { token } = req.body;
    const data = await usermodel.findOne({ email: email });
    if (!data) return res.status(404).json({ message: "user's not found" });
    const checkToken = await forgotpasswordmodel.findOne({ user_id: data._id });
    if (!checkToken)
      return res.status(404).json({ message: "token's not found" });
    if (token !== checkToken.token)
      return res.status(442).json({ message: "token's wrong" });
    await forgotpasswordmodel.deleteOne({ user_id: data._id });
    return res.status(200).json({ message: "success to verify code" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const data = await usermodel.findOne({ email: email });
    if (!data) return res.status(404).json({ message: "user's not found" });
    const code = Math.floor(1000 + Math.random() * 9000);
    // const mail = sendEmail(
    //   data.email,
    //   "Reset password",
    //   `your code is ${code}`
    // );
    // if (mail === "error")
    //   return res.status(500).json({ message: "failed to send email" });
    const token = jwt.sign({ id: data._id }, process.env.JWT_SIGN);
    await forgotpasswordmodel.deleteMany({ user_id: data._id });
    await forgotpasswordmodel.create({ user_id: data._id, token: code });
    return res.status(200).json({ message: "email sent", token });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function resendEmail(req, res) {
  try {
    let body = req.body;
    const data = await usermodel.findOne({ email: body.email });
    if (!data) return res.status(404).json({ message: "user's not found" });
    const code = Math.floor(1000 + Math.random() * 9000);
    // const mail = sendEmail(
    //   data.email,
    //   "Verification code",
    //   `your code is ${code}`
    // );
    // if (mail == "error") {
    //   return res.status(500).json({
    //     message: "Failed to send email. Please check your internet connection",
    //   });
    // }
    await tokenmodel.deleteOne({ user_id: data._id });
    await tokenmodel.create({ user_id: data._id, token: code });
    return res.status(200).json({ message: "email sent" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email } = req.params;
    let body = req.body;
    const data = await usermodel.findOne({ email: email });
    if (!data) return res.status(404).json({ message: "user's not found" });
    if (data.isVerified)
      return res.status(442).json({ message: "email has been verified" });
    const checkToken = await tokenmodel.findOne({
      user_id: data._id,
    });
    if (!checkToken)
      return res.status(404).json({ message: "token' not found" });
    if (body.token !== checkToken.token)
      return res.status(442).json({ message: "token is wrong" });
    await usermodel.updateOne(
      { _id: data._id },
      { $set: { isVerified: true } }
    );
    await tokenmodel.deleteOne({ token: checkToken.token });
    return res.status(200).json({ message: "success to verify email" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function updateProfile(req, res) {
  try {
    let body = req.body;
    const data = await usermodel.findById(
      jwtDecode(req.headers.authorization).id
    );
    if (!data) return res.status(404).json({ message: "user's not found" });
    if (req.file?.path !== undefined) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: "/chat/users" }
      );
      body.photo_profile = secure_url;
      body.public_id = public_id;
      if (data.photo_profile !== null) {
        await cloudinary.uploader.destroy(data.public_id);
      }
    } else {
      body.photo_profile = data.photo_profile;
      body.public_id = data.public_id;
    }
    if (body.password !== undefined) {
      body.password = bcrypt.hashSync(body.password, 10);
    }
    await usermodel.updateOne(
      { _id: jwtDecode(req.headers.authorization).id },
      {
        $set: {
          email: body.email,
          name: body.name,
          password: body.password,
          bio: body.bio,
          photo_profile: body.photo_profile,
          public_id: body.public_id,
        },
      }
    );
    return res.status(200).json({ message: "success" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function logout(req, res) {
  try {
    const data = await usermodel.findById(
      jwtDecode(req.headers.authorization).id
    );
    if (!data) return res.status(404).json({ message: "user's not found" });
    await usermodel.updateOne(
      { id: jwtDecode(req.headers.authorization).id },
      { $set: { token: null } }
    );
    return res.status(200).json({ message: "success to logout" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function login(req, res) {
  try {
    let body = req.body;
    const data = await usermodel.findOne({ email: body.email });
    if (!data) return res.status(404).json({ message: "user's not found" });
    const verify = bcrypt.compareSync(body.password, data.password);
    if (!verify) return res.status(442).json({ message: "password's wrong" });
    const token = jwt.sign({ id: data.id }, process.env.JWT_SIGN);
    if (!data.isVerified)
      return res
        .status(401)
        .json({ message: "email hasn't been verified", token });
    await usermodel.updateOne({ _id: data.id }, { $set: { token: token } });
    return res.status(200).json({ token });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function register(req, res) {
  try {
    let body = req.body;
    const check = await usermodel.findOne({ email: body.email });
    if (check) return res.status(442).json({ message: "email has been used" });
    body.password = bcrypt.hashSync(body.password, 10);
    body.isVerified = true;
    const data = await usermodel.create(body);
    const code = Math.floor(1000 + Math.random() * 9000);

    // const mail = sendEmail(
    //   data.email,
    //   "Verify your email",
    //   `your code is ${code}`
    // );
    const token = jwt.sign({ id: data.id }, process.env.JWT_SIGN);
    // if (mail === "error") {
    //   console.log("failed to send verification email");
    // } else {
    // await tokenmodel.create({ user_id: jwtDecode(token).id, token: code });
    // }
    await usermodel.updateOne(
      { _id: jwtDecode(token).id },
      { $set: { token: token } }
    );
    return res.status(200).json({ token });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

module.exports = {
  updateProfile,
  register,
  login,
  logout,
  verifyEmail,
  resendEmail,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  isOnline,
  isOffline,
  showUserOnline,
  profile,
};
