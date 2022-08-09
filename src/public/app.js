// Put all your frontend code here.
const msgForm = document.querySelector("#msg");
const msgList = document.querySelector("#msgList");
const nickForm = document.querySelector("#nickname");

const socket = new WebSocket(`wss://${window.location.host}`);

function sendMsg(type, payload) {
  const input = { type, payload };
  return JSON.stringify(input);
}

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  const aMsg = document.createElement("li");
  aMsg.innerText = message.data;
  msgList.appendChild(aMsg);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

const handleMsgSubmit = (event) => {
  event.preventDefault();
  const input = msgForm.querySelector("input");
  socket.send(sendMsg("new_message", input.value));
  input.value = "";
};

const handleNickSubmit = (event) => {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  const btn = nickForm.querySelector("input:last-child");
  socket.send(sendMsg("nickname", input.value));
  btn.value = "Set complete!!";
};

msgForm.addEventListener("submit", handleMsgSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
