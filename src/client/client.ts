/// <reference path="../../typings/index.d.ts" />

// Object to pass to the clients when the game state changes
class updateObject {
  players: Player[];
  currentPlayer: number;
  dealer: number;
  potTotal: number;
  potPP: number;
  round: number;
  phase: number;
}

class Player {
  name: string;
  id: string;
  money: number;
  inCurrentPot: number;
  folded: boolean; 
}

// DOM elements
let page = {
  gameContainer: document.getElementById("gameContainer"),
  roundDisplay: document.getElementById("roundDisplay"),
  potDisplay: document.getElementById("potDisplay"),
  moneyDisplay: document.getElementById("moneyDisplay"),
  leaderboard: document.getElementById("leaderboard"),
  checkButton: document.getElementById("checkButton"),
  raiseContainer: document.getElementById("raiseContainer"),
  raiseInput: <HTMLInputElement>document.getElementById("raiseInput"),
  loginContainer: document.getElementById("loginContainer"),
  loginText: document.getElementById("loginText"),
  nameInput: <HTMLInputElement>document.getElementById("nameInput"),
  cards: document.getElementById("cardContainer"),
  winContainer: document.getElementById("winContainer"),
  roomContainer: document.getElementById("roomContainer"),
  roomInput: <HTMLInputElement>document.getElementById("roomInput"),
  existingRooms: document.getElementById("existingRooms")
}

let socket = io();
let userName: string = undefined;
let players: Player[] = [];

function submitName(useExisting?: boolean) {
  if (!useExisting) {
    userName = page.nameInput.value;
  }
  socket.emit("getName", { name: userName });
}

socket.on("nameStatus", function(data) {
  if (data.avaliable) {
    console.log("Name was accepted");
    page.loginContainer.hidden = true;
    page.roomContainer.hidden = false;
  } else {
    page.loginText.innerHTML = "Name is already taken, please choose another:";
  }
});

function joinRoom(room?: string) {
  if (!room) {
    room = page.roomInput.value;
  }
  socket.emit("joinRoom", { room: room });
  page.roomContainer.hidden = true;
  page.gameContainer.classList.remove("blur");
}

socket.on("roomUpdate", function(rooms: {[room:string]:string[]}) {
  console.log(rooms);
  let e = page.existingRooms;
  e.innerHTML = "<p>" + e.children[0].innerHTML + "</p>";
  for (let room in rooms) {
    let button = document.createElement("button");
    button.innerText = room;
    button.onclick = function() { joinRoom(room); }
    e.appendChild(button);
  }
});

function startGame() {
  socket.emit("startGame");
}

socket.on("update", function(data) {
  console.log(data);

  if (data) {
    page.roundDisplay.innerHTML = "Round: <b>" + data.round + "</b>";
    page.potDisplay.innerHTML = "Pot: <b>" + data.potTotal + "</b>";
    // Our money

    page.leaderboard.innerHTML = "";
    for (let p of data.players) {
      let para = document.createElement("p");
      if (p.name == userName) {
        para.innerHTML = "Me";
      } else {
        para.innerHTML = p.name;
      }
      para.innerHTML += ": <b>" + p.money + "</b>";
      if (p.inCurrentPot != 0) {
        para.innerHTML += " &#10132; " + p.inCurrentPot;
      }
      if (p.folded) {
        para.innerHTML = "<s>" + para.innerHTML + "</s>";
      }
      if (data.currentPlayer == data.players.indexOf(p)) {
        para.innerHTML = "<u>" + para.innerHTML + "</u>";
      }
      page.leaderboard.appendChild(para);
    }

    if (data.currentPlayer >= 0 && data.players[data.currentPlayer].name == userName) {
      console.log("Our turn");
      // Enable buttons
    } else {
      console.log("Not our turn");
      // Disable buttons
    }

    switch(data.phase) {
      case 0:
        page.cards.children[0].classList.remove("filled");
        page.cards.children[1].classList.remove("filled");
        page.cards.children[2].classList.remove("filled");
        page.cards.children[3].classList.remove("filled");
        page.cards.children[4].classList.remove("filled");
        break;
      case 3:
        page.cards.children[4].classList.add("filled");
      case 2:
        page.cards.children[3].classList.add("filled");
      case 1:
        page.cards.children[0].classList.add("filled");
        page.cards.children[1].classList.add("filled");
        page.cards.children[2].classList.add("filled");
        break;
    }
  }
});

socket.on("chooseWinner", function() {
  console.log("Time to choose the winner");
  page.winContainer.hidden = false;
  page.gameContainer.classList.add("blur");
  page.winContainer.innerHTML = "<p>Choose the winner:</p>";
  for (let p of players) {
    if (!p.folded) {
      page.winContainer.innerHTML += "<button class='button' onclick=winnerIs('" + p.id + "')>" + p.name + "</button>";
    }
  }
});

function winnerIs(id: string) {
  console.log("Winner is " + id);
  socket.emit("winnerIs", id);
  page.winContainer.hidden = true;
  page.gameContainer.classList.remove("blur");
}

// For testing, probably don't want this
socket.on("reconnect", function() {
  if (userName != undefined) {
    submitName(true);
  }
});

function check() {
  console.log("Check");
  socket.emit("check");
}

function raise() {
  let r = page.raiseInput.value;
  console.log("Raise " + r);
  socket.emit("raise", parseInt(r));
  hideRaiseContainer(true);
}

function hideRaiseContainer(hide: boolean) {
  if (hide) {
    page.raiseContainer.hidden = true;
    page.gameContainer.classList.remove("blur");
  } else {
    page.raiseContainer.hidden = false;
    page.gameContainer.classList.add("blur");
    page.raiseInput.value = "1";
  }
}

function fold() {
  console.log("Fold");
  socket.emit("fold");
}