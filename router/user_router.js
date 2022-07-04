const router = require("express")();
const { upload } = require("../middleware/upload");
const {
  updateProfile,
  register,
  login,
  logout,
  verifyEmail,
  resendEmail,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  showUserOnline,
  profile,
  addFriend,
  askingFriend,
} = require("../controller/user_controller");
const { jwtMiddle } = require("../middleware/jwt_middleware");

router.put("/update", jwtMiddle, upload.single("photo_profile"), updateProfile);
router.post("/register", register);
router.post("/login", login);
router.delete("/logout", jwtMiddle, logout);
router.post("/verify-email/:email", verifyEmail);
router.post("/resend-email", resendEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password/:email", verifyForgotPassword);
router.put("/reset-password", resetPassword);
router.get("/online", jwtMiddle, showUserOnline);
router.get("/profile/:id", jwtMiddle, profile);

module.exports = { userRouter: router };
