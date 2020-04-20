const startButton = document.getElementById("start-game");
const userNameField = document.getElementById("user-name");
const request = new XMLHttpRequest();

request.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    parseUserResponse(this.responseText);
  }
};

startButton.onclick = (_) => {
  let userName = userNameField.value;
  request.open("GET", "https://k5qf9mar6h.execute-api.us-east-1.amazonaws.com/test/user?userName=" + userName);
  request.send();
};

var startGame;
import(
  /* webpackMode: "lazy" */
  /* webpackChunkName: "game" */ "./game"
).then((game) => {
  game.load();
  if (global.player) {
    game.start();
  } else {
    startGame = game.start;
  }
});

function parseUserResponse(r) {
  let response = JSON.parse(r);
  if (response.Count > 0) {
    global.player = {
      name: response.Items[0].username.S,
      new: false,
      money: parseInt(response.Items[0].money.N),
      businessData: JSON.parse(JSON.parse(response.Items[0].businesses.S)), // have to JSON.parse twice because of double quotes
    };
  } else {
    global.player = {
      name: userNameField.value,
      new: true,
      money: 50,
    };
  }
  if (startGame) startGame();
}
