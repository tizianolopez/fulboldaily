document.addEventListener("DOMContentLoaded", async () => {
    console.log("Inicializando juego Who Scored Today");
  
    const gameContainer = document.getElementById("game-container");
    const guessInput = document.getElementById("guess-input");
    const suggestionsContainer = document.getElementById("suggestions");
    const feedbackMessage = document.getElementById("feedback-message");
    const skipButton = document.getElementById("skip-button");
    const alertContainer = document.getElementById("alert-container");

  
    let playersList = [];
    let remainingLives = 3;
    let shownHints = new Set();
    let currentMatch;
  
    // Cargar partidos y seleccionar el partido del día
    async function loadMatch() {
      const response = await fetch("scripts/games.json");
      const data = await response.json();
      const matches = data.matches;
  
      const today = new Date();
      const index = today.getDate() % matches.length; // Seleccionar partido del día
      currentMatch = matches[index];
  
      inflateMatchData();
    }
  
    // Cargar lista de jugadores
    async function loadPlayersList() {
      const response = await fetch("scripts/players.json");
      const data = await response.json();
      playersList = data.list;
    }
  
    // Mostrar el partido en el HTML
    function inflateMatchData() {
      const matchHeader = `
           <div class="match-date">
            <h6>${currentMatch.date}</h6>
            </div>
        <div class="match-header">
          <div class="team-logo">
            <img src="${currentMatch.teams.home.logo}" alt="${currentMatch.teams.home.name} Logo">
          </div>
          <div class="score">
            <span>${currentMatch.score.home}</span>
            <span>-</span>
            <span>${currentMatch.score.away}</span>
          </div>
          <div class="team-logo">
            <img src="${currentMatch.teams.away.logo}" alt="${currentMatch.teams.away.name} Logo">
          </div>
        </div>
      `;
  
      const homeGoals = currentMatch.goals
        .filter((goal) => goal.team === "home")
        .map((goal) => `<li>${goal.minute}' <span id="goal-minute-${goal.minute}">??</span></li>`)
        .join("");
  
      const awayGoals = currentMatch.goals
        .filter((goal) => goal.team === "away")
        .map((goal) => `<li>${goal.minute}' <span id="goal-minute-${goal.minute}">??</span></li>`)
        .join("");
  
      const goalsContainer = `
        <div class="goals-container">
          <div class="team-goals">
            <ul class="goal-list">${homeGoals}</ul>
          </div>
          <div class="team-goals">
            <ul class="goal-list">${awayGoals}</ul>
          </div>
        </div>
      `;
  
      gameContainer.innerHTML = matchHeader + goalsContainer;
    }
  
    // Mostrar sugerencias
    function showSuggestions(input) {
      suggestionsContainer.innerHTML = "";
      if (input.length < 2) return;
  
      const suggestions = playersList.filter((player) =>
        player.toLowerCase().includes(input.toLowerCase())
      );
  
      suggestions.forEach((suggestion) => {
        const li = document.createElement("li");
        li.textContent = suggestion;
  
        li.addEventListener("click", () => {
          guessInput.value = suggestion;
          suggestionsContainer.innerHTML = "";
          checkGuess(suggestion);
        });
  
        suggestionsContainer.appendChild(li);
      });
    }
  
    // Verificar adivinanza
    function checkGuess(guess) {
      const goal = currentMatch.goals.find(
        (g) => g.scorerFull.toLowerCase() === guess.toLowerCase() && !g.guessed
      );
  
      if (goal) {
        revealGoal(goal);
      } else {
        handleIncorrectGuess();
      }
      // Limpiar el texto del input y las sugerencias
      guessInput.value = "";
      suggestionsContainer.innerHTML = "";
    }
  
    // Revelar el gol
    function revealGoal(goal) {
      const goalElement = document.getElementById(`goal-minute-${goal.minute}`);
      goalElement.textContent = goal.scorerShort; // Mostrar nombre corto
      goal.guessed = true;
  
      checkWinCondition();
    }
  
    // Manejar error
    function handleIncorrectGuess() {
      remainingLives--;
      updateAttemptsDisplay();

      if (remainingLives === -1) {
        endGame(false);
      } else {
        revealHint();
      }
    }
  
    // Mostrar pista única
    function revealHint() {
        remainingLives--;
        updateAttemptsDisplay();
        if (remainingLives === -1 ) {
            endGame(false);
            return;
        }
      const unguessedGoals = currentMatch.goals.filter((goal) => !goal.guessed);
      const randomGoal = unguessedGoals.find((goal) => !shownHints.has(goal.minute));
  
      if (randomGoal) {
        shownHints.add(randomGoal.minute);
        const goalElement = document.getElementById(`goal-minute-${randomGoal.minute}`);
        const flagPath = `img/flags/${randomGoal.flag}.png`; // Ruta de la bandera
        goalElement.innerHTML += ` <img src="${flagPath}" alt="Flag of ${randomGoal.flag}" class="flag-icon">`;
      }
    }

    // Actualizar la visualización de los intentos
    function updateAttemptsDisplay() {
        for (let i = 1; i <= 3; i++) {
            const attemptCircle = document.getElementById(`attempt-${i}`);
            if (i > remainingLives) {
                attemptCircle.classList.add("used");
            } else {
                attemptCircle.classList.remove("used");
            }
        }
    }

  
    // Verificar condición de victoria
    function checkWinCondition() {
      if (currentMatch.goals.every((goal) => goal.guessed)) {
        endGame(true);
      }
    }
  
    // Terminar el juego
    function endGame(win) {
        // Deshabilitar los botones y el input
        guessInput.disabled = true;
        skipButton.disabled = true;
        if (win) {
            showAlert("🎉 Congratulations! You guessed all the scorers! 🎉", 5000); // Mensaje de victoria
            fireConfetti(); // Lanza el confeti
          } else {
            currentMatch.goals.forEach(goal => {
                if (!goal.guessed) {
                const goalElement = document.getElementById(`goal-minute-${goal.minute}`);
                goalElement.textContent = goal.scorerShort; // Mostrar nombre corto
                }
            });
            showAlert("You lost! Improve your ball knowledge and try again tomorrow!", 5000); // Mensaje de derrota
        }
        
        
    
        
    }

    function showAlert(message, duration = 1000) {
        const alert = document.createElement("div");
        alert.textContent = message;
        alert.classList.add("alert");
        alertContainer.prepend(alert); // Agregar al contenedor de alertas
        if (duration == null) return;
      
        setTimeout(() => {
          alert.classList.add("hide");
          alert.addEventListener("transitionend", () => {
            alert.remove();
          });
        }, duration);
      }
      

    function fireConfetti() {
        const count = 200;
        const defaults = {
          origin: { y: 1 }, // Ajusta la posición del confeti
        };
      
        function fire(particleRatio, opts) {
          confetti(
            Object.assign({}, defaults, opts, {
              particleCount: Math.floor(count * particleRatio),
            })
          );
        }
      
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }
      
  
    // Eventos
    guessInput.addEventListener("input", () => {
      showSuggestions(guessInput.value);
    });
  
    guessInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkGuess(guessInput.value.trim());
        guessInput.value = "";
      }
    });
  
    skipButton.addEventListener("click", revealHint);
  
    // Inicializar
    await loadPlayersList();
    await loadMatch();
    updateAttemptsDisplay();
  });
  