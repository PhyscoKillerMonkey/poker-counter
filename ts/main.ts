// Global variables
let players: Player[] = [];
let startMoney = 100;
let bigBlind = 4;

// Game variables
let round = 0;
let phase = 0;
let raiseAmount = 1;
let potTotal = 0;
let potPerPlayer = 0;
let currentPlayer = 0;
let playersReady = 0;
let playersFolded = 0;

// DOM elements
let page = {
  roundDisplay: document.getElementById("roundDisplay"),
  phaseDisplay: document.getElementById("phaseDisplay"),
  playerName: document.getElementById("nameDisplay"),
  potTotal: document.getElementById("potDisplay"),
  playerPot: document.getElementById("potPPDisplay"),
  checkButton: document.getElementById("checkButton"),
  betButton: document.getElementById("betButton"),
  leaderboard: document.getElementById("leaderboard")
}

/**
 * Player
 */
class Player {

  name: string;
  money: number;
  inCurrentPot: number;
  folded: boolean;

  constructor(name: string, money: number) {
    this.name = name;
    this.money = money;
    this.inCurrentPot = 0;
  }

  pay(amount: number) {
    this.money -= amount;
    this.inCurrentPot += amount;
    potTotal += amount;
  }

  choose() {
    console.log(this.name + " choose check, raise or fold");
  }
}

function updateDisplay() {
  page.roundDisplay.innerHTML = "Round: " + round;
  page.phaseDisplay.innerHTML = "Phase: " + phase;
  page.playerName.innerHTML = players[currentPlayer].name;
  page.potTotal.innerHTML = "Pot: £" + potTotal;
  page.playerPot.innerHTML = "Per Player: £" + potPerPlayer;
  page.betButton.innerHTML = "Raise £" + raiseAmount;

  var betDifference = potPerPlayer - players[currentPlayer].inCurrentPot;
  if (betDifference == 0) {
    page.checkButton.innerHTML = "Check";
  } else {
    page.checkButton.innerHTML = "Call £" + betDifference;
  }

  page.leaderboard.innerHTML = "";
  console.log(players);
  for (let p of players) {
    var line = document.createElement("p");
    if (p.folded) {
      line.innerHTML = "<s>" + p.name + " £" + p.money + "</s>"; 
    } else {
      line.innerHTML = p.name + " £" + p.money;
    }
    page.leaderboard.appendChild(line);
  }
}

function nextPlayer() {
  currentPlayer++;
  if (currentPlayer >= players.length) { currentPlayer = 0; }
  while (players[currentPlayer].folded) {
    if (currentPlayer < players.length - 1) { 
      currentPlayer++; 
    } else {
      currentPlayer = 0;
    }
  }
}

function check() {
  console.log("Player checked");

  let p = players[currentPlayer];
  p.pay(potPerPlayer - p.inCurrentPot);

  playersReady++;
  nextPlayer();
  doStuff();
}

function lowerRaise() {
  if (raiseAmount > 1) {
    raiseAmount--;
    updateDisplay();
  }
}

function increaseRaise() {
  raiseAmount++;
  updateDisplay();
}

function raise() {
  potPerPlayer += raiseAmount;

  let p = players[currentPlayer];
  p.pay(potPerPlayer - p.inCurrentPot);
  
  playersReady = 1;
  nextPlayer();
  doStuff();
}

function fold() {
  console.log("Player folded");
  players[currentPlayer].folded = true;
  nextPlayer();
  playersFolded++;
  doStuff();
}

function newRound() {
  // We are in the next round
  round++;

  // Reset variables
  phase = 0;
  currentPlayer = 0;
  playersReady = 1;
  playersFolded = 0;

  for (let p of players) {
    p.folded = false;
  }

  // Make players pay big-blind and little-blind
  let firstPlayer = round % players.length - 1;
  players[firstPlayer].pay(bigBlind / 2);
  players[firstPlayer + 1].pay(bigBlind);
  potPerPlayer = bigBlind;
  currentPlayer = firstPlayer + 2;

  if (currentPlayer > players.length - 1) {
    currentPlayer = 0;
  }

  doStuff();
}

function doStuff() {
  console.log("Phase " + phase);
  updateDisplay();
  if (playersReady < players.length - playersFolded) {
    raiseAmount = 1;
    console.log("Player " + currentPlayer + "'s turn.")
  } else {
    // We are going into the next phase
    currentPlayer = 0;
    playersReady = 0;
    raiseAmount = 1;
    phase++;
    if (phase == 4) {
      // Game finished!
      console.log("Game is finished!");
    } else if (phase < 4) {
      doStuff();
    }
  }
}

window.onload = function () {
  console.log("Hello world!");
  players.push(new Player("Reece", startMoney));
  players.push(new Player("Laura", startMoney));
  players.push(new Player("Rando", startMoney));
  newRound();
}