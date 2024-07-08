document.addEventListener("DOMContentLoaded", () => {
  const guessInput = document.getElementById("guess-input");
  const skipButton = document.getElementById("skip-button");
  const tableBody = document.getElementById("table-body");
  const message = document.getElementById("message");
  const suggestionsContainer = document.getElementById("suggestions");

  let transferHistory = [];
  let playersList = [];
  let selectedPlayer;
  let playerTransfers;
  let revealedRows = 0;
  let selectedSuggestionIndex = -1;

  async function loadTransferHistory() {
    try {
      const response = await fetch('scripts/transfer_history.json');
      transferHistory = await response.json();
      initializeGame();
    } catch (error) {
      console.error('Error loading transfer history:', error);
      message.textContent = 'Error loading transfer history.';
    }
  }

  async function loadPlayersList() {
    try {
      const response = await fetch('scripts/players.json');
      const data = await response.json();
      playersList = data.list;
    } catch (error) {
      console.error('Error loading players list:', error);
      message.textContent = 'Error loading players list.';
    }
  }

  function getRandomPlayer() {
    const players = [...new Set(transferHistory.map(item => item.player_name))];
    return players[Math.floor(Math.random() * players.length)];
  }

  function initializeGame() {
    selectedPlayer = getRandomPlayer();
    playerTransfers = transferHistory.filter(item => item.player_name === selectedPlayer);
    playerTransfers.reverse(); // Invertir el orden de las transferencias
    revealedRows = 0;
    tableBody.innerHTML = "";
    message.textContent = "";
    guessInput.disabled = false;
    skipButton.disabled = false;

    playerTransfers.forEach(() => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>??/??</td>
        <td>???</td>
        <td>???</td>
      `;
      tableBody.appendChild(row);
    });
    revealNextRow();
  }

  function revealNextRow() {
    if (revealedRows < playerTransfers.length) {
      const row = tableBody.rows[revealedRows];
      row.cells[0].textContent = playerTransfers[revealedRows].season;
      row.cells[1].textContent = playerTransfers[revealedRows].team_from;
      row.cells[2].textContent = playerTransfers[revealedRows].team_to;
      row.classList.add("reveal");
      revealedRows++;
    } else {
      message.textContent = `You lost! The player was ${selectedPlayer}.`;
      endGame(false);
    }
  }

  function handleGuess(guess) {
    if (guess.toLowerCase() === selectedPlayer.toLowerCase()) {
      message.textContent = `Correct! The player is ${selectedPlayer}.`;
      guessInput.classList.add("dance");
      endGame(true);
    } else {
      message.textContent = "Incorrect guess. Try again!";
      guessInput.classList.add("shake");
      setTimeout(() => {
        guessInput.classList.remove("shake");
      }, 500);
      revealNextRow();
    }
  }

  function showSuggestions(input) {
    suggestionsContainer.innerHTML = "";
    if (input.length < 2) {
      return;
    }

    const suggestions = playersList.filter(player => 
      player.toLowerCase().split(' ').some(word => word.startsWith(input.toLowerCase()))
    );

    suggestions.forEach((suggestion, index) => {
      const li = document.createElement("li");
      li.textContent = suggestion;
      li.addEventListener("click", () => {
        guessInput.value = suggestion;
        suggestionsContainer.innerHTML = "";
        handleGuess(suggestion);
      });
      suggestionsContainer.appendChild(li);

      // Agregar eventos para navegar con teclado
      li.addEventListener("mouseenter", () => {
        selectedSuggestionIndex = index;
        setActiveSuggestion();
      });
    });

    selectedSuggestionIndex = -1; // Reiniciar el índice seleccionado al buscar de nuevo
  }

  function setActiveSuggestion() {
    const suggestions = suggestionsContainer.querySelectorAll("li");

    suggestions.forEach((suggestion, index) => {
      if (index === selectedSuggestionIndex) {
        suggestion.classList.add("active");
        guessInput.value = suggestion.textContent; // Auto-completar el campo con la sugerencia seleccionada
      } else {
        suggestion.classList.remove("active");
      }
    });
  }

  function endGame(won) {
    guessInput.disabled = true;
    skipButton.disabled = true;
    if (!won) {
      Array.from(tableBody.rows).forEach(row => {
        row.classList.add("lost");
      });
    }
  }

  guessInput.addEventListener("input", () => {
    showSuggestions(guessInput.value);
  });

  guessInput.addEventListener("keydown", (event) => {
    const suggestions = suggestionsContainer.querySelectorAll("li");

    if (event.key === "ArrowDown") {
      selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
      setActiveSuggestion();
    } else if (event.key === "ArrowUp") {
      selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
      setActiveSuggestion();
    } else if (event.key === "Enter") {
      event.preventDefault(); // Evitar que el formulario se envíe
      if (selectedSuggestionIndex !== -1) {
        guessInput.value = suggestions[selectedSuggestionIndex].textContent;
      }
      handleGuess(guessInput.value);
      suggestionsContainer.innerHTML = "";
    }
  });

  skipButton.addEventListener("click", revealNextRow);

  loadTransferHistory();
  loadPlayersList();
});
