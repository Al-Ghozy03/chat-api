const { jwtMiddle } = require("../middleware/jwt_middleware");
const { friendRouter } = require("./friend_router");
const { userRouter } = require("./user_router");

const router = require("express")();

router.use("/user", userRouter);
router.use(jwtMiddle);
router.use("/friend", friendRouter);

module.exports = { router };
