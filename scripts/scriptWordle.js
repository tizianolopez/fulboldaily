import targetWords from "./targetWords.js";

const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
const newGameButton = document.getElementById("newGameButton");
const offsetFromDate = new Date(2024, 5, 6);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
let targetWord = targetWords[Math.floor(dayOffset) % targetWords.length];

let WORD_LENGTH = targetWord.length;
const allWords = Array.from(new Set([...targetWords]));
generateGrid();
startInteraction();

function generateGrid() {
  guessGrid.innerHTML = '';
  guessGrid.style.gridTemplateColumns = `repeat(${WORD_LENGTH}, minmax(3vw, 1fr))`;
  guessGrid.style.gridTemplateRows = `repeat(6, minmax(3vw, 1fr))`;

  for (let i = 0; i < 6 * WORD_LENGTH; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    guessGrid.appendChild(tile);
  }
}

function startInteraction() {
  newGameButton.classList.add("hidden");
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }
  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }
  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }
  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }
  if (e.key.match(/^[a-zA-Z]$/)) {
    pressKey(e.key.toLowerCase());
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");



  stopInteraction();
  let used = Array(WORD_LENGTH).fill(0);
  let marker = Array(WORD_LENGTH).fill(0);
  activeTiles.forEach((tile, index, array) => markWrongLocation(tile, index, array, used, marker));
  activeTiles.forEach((tile, index, array) => markCorrect(tile, index, array, used, marker));
  activeTiles.forEach((tile, index, array) => flipTile(tile, index, array, guess, marker));
}

function markCorrect(tile, index, array, used, marker) {
  const letter = tile.dataset.letter;
  if (targetWord[index] === letter) {
    marker[index] = 1;
    used[index] = 1;
  }
}

function markWrongLocation(tile, index, array, used, marker) {
  const letter = tile.dataset.letter;
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (targetWord[i] === letter && used[i] === 0) {
      marker[index] = 2;
      used[i] = 1;
      break;
    }
  }
}

function flipTile(tile, index, array, guess, marker) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener("transitionend", () => {
    tile.classList.remove("flip");
    if (marker[index] === 1) {
      tile.dataset.state = "correct";
      key.classList.add("correct");
    } else if (marker[index] === 2) {
      tile.dataset.state = "wrong-location";
      key.classList.add("wrong-location");
    } else {
      tile.dataset.state = "wrong";
      key.classList.add("wrong");
    }

    if (index === array.length - 1) {
      tile.addEventListener("transitionend", () => {
        startInteraction();
        checkWinLose(guess, array);
      }, { once: true });
    }
  }, { once: true });
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener("animationend", () => {
      tile.classList.remove("shake");
    }, { once: true });
  });
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert("Well done, you won today's wordle!!", 5000);
    danceTiles(tiles);
    fireConfetti();

    //newGameButton.classList.remove("hidden");
    stopInteraction();
    return;
  }

  
function fireConfetti() {
  const count = 200,
      defaults = {
          origin: { y: 1 },
      };

  function fire(particleRatio, opts) {
      confetti(
          Object.assign({}, defaults, opts, {
              particleCount: Math.floor(count * particleRatio),
          })
      );
  }

  fire(0.25, {
      spread: 26,
      startVelocity: 55,
  });

  fire(0.2, {
      spread: 60,
  });

  fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
  });

  fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
  });

  fire(0.1, {
      spread: 120,
      startVelocity: 45,
  });
}


  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    showAlert("Im sorry, you lost. The player was " + targetWord.toUpperCase(), null);
    stopInteraction();
    newGameButton.classList.remove("hidden");
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener("animationend", () => {
        tile.classList.remove("dance");
      }, { once: true });
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}

newGameButton.addEventListener("click", startNewGame);

function startNewGame() {
  const tiles = Array.from(document.getElementsByClassName("tile"));
  tiles.forEach((e) => {
    setTimeout(() => {
      e.classList.add("flip");
    }, FLIP_ANIMATION_DURATION / 2);
    e.addEventListener("transitionend", () => {
      e.classList.remove("flip");
      e.textContent = "";
      delete e.dataset.state;
      delete e.dataset.letter;
    }, { once: true });
  });
  const keys = Array.from(document.getElementsByClassName("key"));
  keys.forEach((e) => {
    e.classList.remove("correct");
    e.classList.remove("wrong-location");
    e.classList.remove("wrong");
  });

  // Update the target word index for the new game
  targetWord = targetWords[(Math.floor(dayOffset) % targetWords.length + 1) % targetWords.length];
  WORD_LENGTH = targetWord.length;
  generateGrid();
  startInteraction();
}