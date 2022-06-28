require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { router } = require("./router/router");
const app = express();
const http = createServer(app);
const io = new Server(http);
const cors = require("cors");
const { isOnline, isOffline } = require("./controller/user_controller");

app.use(cors());
app.use(express.json());
app.use(router);

io.on("connection", (socket) => {
  console.log(`${socket.id} join`);
  socket.on("online", (data) => {
    isOnline(data);
  });
  socket.on("offline", (data) => {
    isOffline(data);
  });
  socket.on("disconnect", (data) => {
    console.log(data);
    console.log(`${socket.id} disconnect`);
  });
});

http.listen(process.env.PORT);
