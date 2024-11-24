document.addEventListener("DOMContentLoaded", () => {
    console.log("Página cargada, inicializando el juego...");
  
    const gameContainer = document.getElementById("game-container");
    const guessInput = document.getElementById("guess-input");
    const suggestionsContainer = document.getElementById("suggestions");
    const skipButton = document.getElementById("skip-button");
  
    let playersList = [];
    let remainingLives = 3;
  
    const matches = [
      {
        id: 1,
        date: "2020-08-14",
        teams: {
          home: { name: "Barcelona", logo: "img/barcelona-logo.png" },
          away: { name: "Bayern Munich", logo: "img/bayern-logo.png" },
        },
        score: { home: 2, away: 8 },
        goals: [
          { minute: 7, scorer: "David Alaba", hint: "🇦🇹", ownGoal: true, team: "home" },
          { minute: 57, scorer: "Luis Suarez", hint: "🇺🇾", team: "home" },
          { minute: 22, scorer: "Perisic", hint: "🇭🇷", team: "away" },
          { minute: 27, scorer: "Gnabry", hint: "🇩🇪", team: "away" },
          { minute: 63, scorer: "Joshua Kimmich", hint: "🇩🇪", team: "away" },
          { minute: 82, scorer: "Lewandowski", hint: "🇵🇱", team: "away" },
        ],
      },
    ];
  
    const match = matches[0]; // Selección del partido inicial
  
    // Inflar el HTML del partido
    function inflateMatchData() {
      const matchHeader = `
        <div class="match-header">
          <div class="team-logo">
            <img src="${match.teams.home.logo}" alt="${match.teams.home.name} Logo">
          </div>
          <div class="score">
            <span>${match.score.home}</span>
            <span>-</span>
            <span>${match.score.away}</span>
          </div>
          <div class="team-logo">
            <img src="${match.teams.away.logo}" alt="${match.teams.away.name} Logo">
          </div>
        </div>
      `;
  
      const homeGoals = match.goals
        .filter((goal) => goal.team === "home")
        .map(
          (goal) =>
            `<li>${goal.minute}' <span id="goal-minute-${goal.minute}">??</span></li>`
        )
        .join("");
  
      const awayGoals = match.goals
        .filter((goal) => goal.team === "away")
        .map(
          (goal) =>
            `<li>${goal.minute}' <span id="goal-minute-${goal.minute}">??</span></li>`
        )
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
  
    // Cargar la lista de jugadores
    async function loadPlayersList() {
      try {
        const response = await fetch("scripts/players.json"); // Ruta del archivo JSON
        const data = await response.json();
        playersList = data.list;
        console.log("Lista de jugadores cargada:", playersList);
      } catch (error) {
        console.error("Error al cargar la lista de jugadores:", error);
      }
    }
  
    // Mostrar sugerencias dinámicas
    function showSuggestions(input) {
      suggestionsContainer.innerHTML = ""; // Limpiar sugerencias anteriores
      if (input.length < 2) return; // No mostrar sugerencias si el input es muy corto
  
      const suggestions = playersList.filter((player) =>
        player.toLowerCase().includes(input.toLowerCase())
      );
  
      suggestions.forEach((suggestion) => {
        const li = document.createElement("li");
        li.textContent = suggestion;
  
        li.addEventListener("click", () => {
          guessInput.value = suggestion;
          suggestionsContainer.innerHTML = "";
          checkGuess(suggestion); // Verificar si es correcto
        });
  
        suggestionsContainer.appendChild(li);
      });
    }

     // Función para manejar el envío del jugador
     function handleGuess() {
        const guess = guessInput.value.trim();
        if (guess) {
          console.log(`Jugador adivinado: ${guess}`);
          checkGuess(guess);
          // Aquí puedes agregar la lógica para verificar el jugador adivinado
          guessInput.value = ""; // Limpiar el texto del input
          suggestionsContainer.innerHTML = ""; // Limpiar las sugerencias

        }
      }
    
      // Evento para detectar la tecla Enter en el input
      guessInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleGuess();
        }
      });
  
    // Comprobar si el jugador es correcto
    function checkGuess(guess) {
      const allGoals = [...match.goals];
      const foundGoal = allGoals.find(
        (goal) =>
          goal.scorer.toLowerCase() === guess.toLowerCase() && !goal.guessed
      );
  
      if (foundGoal) {
        revealGoal(foundGoal);
      } else {
        handleIncorrectGuess();
      }
    }
  
    // Revelar un gol correctamente adivinado
    function revealGoal(goal) {
      const goalElement = document.getElementById(`goal-minute-${goal.minute}`);
      goalElement.textContent = goal.scorer;
      goal.guessed = true;
      checkWinCondition();
    }
  
    // Manejar errores de adivinanza
    function handleIncorrectGuess() {
      remainingLives--;
      if (remainingLives > 0) {
        revealHint();
      } else {
        endGame(false);
      }
    }
  
    // Mostrar pista (bandera de un goleador aleatorio no adivinado)
    function revealHint() {
      const unguessedGoals = match.goals.filter((goal) => !goal.guessed);
  
      if (unguessedGoals.length > 0) {
        const randomGoal =
          unguessedGoals[Math.floor(Math.random() * unguessedGoals.length)];
        const goalElement = document.getElementById(
          `goal-minute-${randomGoal.minute}`
        );
        goalElement.textContent += ` ${randomGoal.hint}`;
      }
    }
  
    // Verificar condición de victoria
    function checkWinCondition() {
      if (match.goals.every((goal) => goal.guessed)) {
        endGame(true);
      }
    }
  
    // Terminar el juego
    function endGame(win) {
      const feedbackMessage = document.getElementById("feedback-message");
      feedbackMessage.textContent = win
        ? "Congratulations! You guessed all the scorers!"
        : "Game Over! Better luck next time!";
    }
  
    // Manejar entradas del usuario
    guessInput.addEventListener("input", () => {
      showSuggestions(guessInput.value);
    });
  
    skipButton.addEventListener("click", revealHint);
  
    // Inicializar el sistema
    inflateMatchData();
    loadPlayersList();
  });
  