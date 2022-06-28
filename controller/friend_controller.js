const { usermodel, friendmodel } = require("../model/model");
const { default: jwtDecode } = require("jwt-decode");
const { ObjectId } = require("mongodb");

async function searchFriend(req, res) {
  try {
    const data = await usermodel.aggregate([
      {
        $match: {
          _id: { $ne: ObjectId(jwtDecode(req.headers.authorization).id) },
        },
      },
      {
        $project: {
          email: "$email",
          name: "$name",
          bio: "$bio",
          photo_profile: "$photo_profile",
          status: "$status",
        },
      },
      {
        $lookup: {
          from: "friends",
          localField: "_id",
          foreignField: "to",
          as: "friend",
          // pipeline: [
          //   {
          //     $match: {
          //       from: {
          //         $ne: ObjectId(jwtDecode(req.headers.authorization).id),
          //       },
          //     },
          //     // $match: {
          //     //   to: {
          //     //     $ne: ObjectId(jwtDecode(req.headers.authorization).id),
          //     //   },
          //     // },
          //   },
          // ],
        },
      },
    ]);
    return res.json({ data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function listAddFriend(req, res) {
  try {
    const data = await friendmodel.aggregate([
      {
        $match: { to: ObjectId(jwtDecode(req.headers.authorization).id) },
      },
      {
        $project: {
          from: "$from",
          to: "$to",
          status: "$status",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                email: "$email",
                name: "$name",
                photo_profile: "$photo_profile",
              },
            },
          ],
        },
      },
    ]);

    return res.json({ data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function acceptFriend(req, res) {
  try {
    const { id } = req.params;
    const data = await friendmodel.findOne({
      $and: [{ from: id }, { to: jwtDecode(req.headers.authorization).id }],
    });
    if (!data) return res.status(404).json({ message: "data is not found" });
    if (data.status === "friend")
      return res.status(442).json({ message: "user has been added to friend" });
    await friendmodel.updateOne(
      {
        to: jwtDecode(req.headers.authorization).id,
        from: id,
      },
      { $set: { status: "friend" } }
    );
    return res.json({ message: "added to friend" });
  } catch (er) {
    console.log(er);
    return res.status(442).json();
  }
}

async function addFriend(req, res) {
  try {
    const { id } = req.params;
    const data = await usermodel.findById(id);
    const from = jwtDecode(req.headers.authorization).id;
    if (!data) return res.status(404).json({ message: "user's not found" });
    const check = await friendmodel.findOne({
      $or: [
        { $and: [{ from: from }, { to: id }] },
        { $and: [{ from: id }, { to: from }] },
      ],
    });
    if (check)
      return res.status(442).json({ message: "has been added to friend" });
    await friendmodel.create({
      from: from,
      to: id,
      status: "ask",
    });
    return res.status(200).json({ message: "success" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function listFriends(req, res) {
  try {
    const data = await friendmodel.aggregate([
      {
        $match: {
          $or: [
            { from: ObjectId(jwtDecode(req.headers.authorization).id) },
            { to: ObjectId(jwtDecode(req.headers.authorization).id) },
          ],
        },
      },
      {
        $match: { status: "friend" },
      },
      {
        $project: {
          from: "$from",
          to: "$to",
          status: "$status",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "asker",
          pipeline: [
            {
              $project: {
                email: "$email",
                name: "$name",
                photo_profile: "$photo_profile",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          as: "receiver",
          pipeline: [
            {
              $project: {
                email: "$email",
                name: "$name",
                photo_profile: "$photo_profile",
              },
            },
          ],
        },
      },
    ]);
    return res.json({ data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

module.exports = {
  listFriends,
  addFriend,
  acceptFriend,
  listAddFriend,
  searchFriend,
};
