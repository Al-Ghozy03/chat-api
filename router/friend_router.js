const {
  listFriends,
  addFriend,
  acceptFriend,
  searchFriend,
  listAskingFriend,
} = require("../controller/friend_controller");

const router = require("express")();

router.get("/", listFriends);
router.post("/add/:id", addFriend);
router.put("/accept/:id", acceptFriend);
router.get("/asking-friend", listAskingFriend);
router.get("/search", searchFriend);

module.exports = { friendRouter: router };
