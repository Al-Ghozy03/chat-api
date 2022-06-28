const { listFriends, addFriend, acceptFriend, listAddFriend, searchFriend } = require("../controller/friend_controller");

const router = require("express")();

router.get("/", listFriends);
router.post("/add/:id",addFriend)
router.put("/accept-friend/:id",acceptFriend)
router.get("/list-add-friend",listAddFriend)
router.get("/search",searchFriend)

module.exports = { friendRouter: router };
