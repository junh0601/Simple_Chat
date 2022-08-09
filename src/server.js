import http from "http";
import WebSocket from "ws";
import express from "express";

const PORT = process.env.PORT || 4000;
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let sockets = [];
let users = 0;

function sendMsg(type, payload) {
  const input = { type, payload };
  return JSON.stringify(input);
}

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  socket["nickname"] = "익명";
  sockets.push(socket);
  users = sockets.length;
  sockets.forEach((s)=>{
    s.send(sendMsg("count", users));
  });
  socket.on("close", () => {
    console.log("Disconnected from the Browser ❌");
    sockets = sockets.filter((i) => i!==socket);
    users = sockets.length;
      sockets.forEach((s)=>{
    s.send(sendMsg("count", users));
  });
  });
  socket.on("message", (message) => {
    const parsedMsg = JSON.parse(message);
    switch (parsedMsg.type) {
      case "new_message":
        sockets.forEach((aSocket) => {
          aSocket.send(sendMsg("chat", `${socket.nickname} : ${parsedMsg.payload}`))
        });
        break;
      case "nickname":
        socket["nickname"] = parsedMsg.payload;
        break;
      default:
    };
  });
});


server.listen(PORT, handleListen);
