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

const sockets = [];

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  socket["nickname"] = "Anonymous";
  sockets.push(socket);
  socket.on("close", () => console.log("Disconnected from the Browser ❌"));
  socket.on("message", (message) => {
    const parsedMsg = JSON.parse(message);
    switch (parsedMsg.type) {
      case "new_message":
        sockets.forEach((aSocket) => {
          aSocket.send(`${socket.nickname} : ${parsedMsg.payload}`);
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
