var startGameButton = document.getElementById("loading-game");

import(
    /* webpackMode: "lazy" */
    /* webpackChunkName: "game" */ './game').then((game) => {
        startGameButton.innerText = "Start"
        startGameButton.onclick = function() {
            let playerName = document.getElementById("player-name").value
            game.start(playerName)
        }
})