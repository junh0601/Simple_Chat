import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

//functions

function publicRoom() {
  const {
    sockets: {
      adapter: { sids, rooms }
    }
  } = wsServer;
  const publicRoom = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      const users = rooms.get(key)?.size;
      publicRoom.push({ room: key, users });
    }
  });
  return publicRoom;
}

//wsServer
wsServer.on("connection", (socket) => {
  socket["nickname"] = "anan";
  console.log(`<${socket.nickname}> is connected!! `);

  //onAny
  socket.onAny((e) => {
    console.log(`event accured : ${e}`);
  });

  //on message
  socket.on("message", (room, msg) => {
    console.log(`${room}/${socket.nickname} send msg : ${msg}`);
    socket.to(room).emit("message", "chat", socket.nickname, msg);
  });

  //on name_changed
  socket.on("name_changed", (room, name) => {
    const nameBefore = socket.nickname;
    socket.nickname = name;
    socket
      .to(room)
      .to(socket.id)
      .emit(
        "message",
        "notice",
        socket.nickname,
        `"${nameBefore}" changed name to "${socket.nickname}"`
      );
  });

  //on enter_room
  socket.on("enter_room", (room) => {
    console.log(`'${socket.nickname}' enter the room /${room}`);
    socket.join(room);
    wsServer.sockets.emit("room_changed", publicRoom());
    socket
      .to(room)
      .emit(
        "message",
        "notice",
        socket.nickname,
        `${socket.nickname} enter the room "${room}"`
      );
  });

  //on exit_room
  socket.on("exit_room", (room) => {
    socket.leave(room);
    wsServer.sockets.emit("room_changed", publicRoom());
    socket
      .to(room)
      .emit(
        "message",
        "notice",
        socket.nickname,
        `${socket.nickname} exit the room "${room}"`
      );
  });

  //on disconnected
  socket.on("disconnect", () => {
    console.log(`<${socket.nickname}> is disconnected`);
    wsServer.sockets.emit("room_changed", publicRoom());
  });
});

const handleListen = () =>
  console.log(`Server Listening on http://localhost:${PORT}`);
httpServer.listen(PORT, handleListen);
