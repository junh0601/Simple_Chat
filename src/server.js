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
  socket["nickname"] = "익명";
  console.log(`<${socket.nickname}>님이 연결됨 `);

  //onAny
  socket.onAny((e) => {
    console.log(`이벤트 발생 : ${e}`);
  });

  //on message
  socket.on("message", (room, msg) => {
    console.log(`${room}/${socket.nickname}님이 메시지 전송 : ${msg}`);
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
        `"${nameBefore}"님이 "${socket.nickname}으로 이름을 변경하였습니다"`
      );
  });

  //on enter_room
  socket.on("enter_room", (room) => {
    socket.join(room);
    wsServer.sockets.emit("room_changed", publicRoom());
    socket
      .to(room)
      .emit(
        "message",
        "notice",
        socket.nickname,
        `${socket.nickname} 님이  #${room} 방에 입장하셨습니다.`
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
        `${socket.nickname}님이 #${room} 방을 나갔습니다`
      );
  });

  //on disconnected
  socket.on("disconnect", () => {
    console.log(`<${socket.nickname}>님 접속 종료`);
    wsServer.sockets.emit("message", "notice", socket.nickname, `${socket.nickname}님이 접속을 종료했습니다`);
  });
});

const handleListen = () =>
  console.log(`Server Listening on http://localhost:${PORT}`);
httpServer.listen(PORT, handleListen);
