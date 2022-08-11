const socket = io();

const chatForm = document.querySelector("#chatForm");
const nameForm = document.querySelector("#nameForm");
const roomForm = document.querySelector("#roomForm");
const roomList = document.querySelector("#roomList");
const chatList = document.querySelector("#chatList");
const exitBtn = document.querySelector("#exitBtn");
const chatClear = document.querySelector("#chatClear");
const navRoom = document.querySelector("#navRoom");
const navName = document.querySelector("#navName");
const bottom = document.querySelector("#bottom");

//functions

function paintMsg(msg, style, cls, name) {
  const div = document.createElement("div");
  const chatContainer = document.createElement("div");
  const small = document.createElement("small");
  const li = document.createElement("li");
  li.innerText = msg;
  li.style.cssText = style;
  small.innerText = name ? name : "";
  div.classList.add(cls);
  chatContainer.appendChild(small);
  chatContainer.appendChild(li);
  div.appendChild(chatContainer);
  chatList.appendChild(div);
  bottom.scrollIntoView();
}

function enterRoom(room) {
  chatList.innerHTML = "";
  socket.emit("enter_room", room);
  roomName = room;
  const currentRoom = document.querySelector("#currentRoom");
  currentRoom.innerText = `현재 채팅방 : #${roomName}`;
  paintMsg(`#${room} 방에 입장하셨습니다. `, `color:gray;`, "sysChat");
  roomForm.classList.add("hidden");
}

//===initial seq ===

const initialRoom = "메인";
let roomName = initialRoom;
let myName = "익명";
roomForm.querySelector("input").value = initialRoom;
enterRoom(initialRoom);
paintMsg(`'${myName}' 님 안녕하세요.`,`color:gray;` , "sysChat");
//=== socket io events ===

// on message
socket.on("message", (type, nickname, msg) => {
  let style = "";
  switch (type) {
    case "chat":
      paintMsg(msg, style, "normalChat", nickname);
      break;
    case "notice":
      style = "color:skyblue;";
      paintMsg(msg, style, "sysChat");
      break;
    default:
  }
});

socket.on("room_changed", (r) => {
  roomList.innerHTML = "";
  console.log(r);
  r.forEach((r) => {
    const li = document.createElement("li");
    li.innerText = `#${r.room} (${r.users}명)`;
    roomList.appendChild(li).addEventListener("click", function () {
      if (roomName === r.room) {
        paintMsg(`이미 #${roomName}방에 입장하셨습니다.`, `color:orange;`, "sysChat");
      } else {
        socket.emit("exit_room", roomName);
        enterRoom(r.room);
      }
    });
  });
});

//==== DOM events ====

const handleChatSubmit = (e) => {
  e.preventDefault();
  const input = chatForm.querySelector("input");
  if (input.value !== "") {
    socket.emit("message", roomName, input.value);
    paintMsg(input.value, "", "mychat", `나(${myName})`);
    input.value = "";
  }
};

const handleNameSubmit = (e) => {
  e.preventDefault();
  const input = nameForm.querySelector("input");
  socket.emit("name_changed", roomName, input.value);
  paintMsg(
    `이름 변경 완료 : '${myName}' -> '${input.value}'`,
    `color : skyblue;`,
    "sysChat"
  );
  nameForm.classList.add("hidden");
  myName=input.value;
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = roomForm.querySelector("input");
  socket.emit("exit_room", roomName);
  enterRoom(input.value);
};

const handleExitBtn = (e) => {
  if (roomName === initialRoom) {
    paintMsg(
      `#${initialRoom} 방을 나갈 수 없습니다. `,
      `color:orange;`,
      "sysChat"
    );
  } else {
    socket.emit("exit_room", roomName);
    paintMsg(`#${roomName} 방을 나갑니다`, `color;orange;`);
    enterRoom(initialRoom);
  }
};

chatForm.addEventListener("submit", handleChatSubmit);
nameForm.addEventListener("submit", handleNameSubmit);
roomForm.addEventListener("submit", handleRoomSubmit);
exitBtn.addEventListener("click", handleExitBtn);
chatClear.addEventListener("click", () => (chatList.innerHTML = ""));

navRoom.addEventListener("click", () => {
  roomForm.classList.toggle("hidden");
  nameForm.classList.add("hidden");
});

navName.addEventListener("click", () => {
  nameForm.classList.toggle("hidden");
  roomForm.classList.add("hidden");
});
