let formations = [
    {
        "GK": null,
        "LB": null,
        "CB1": null,
        "CB2": null,
        "RB": null,
        "LM": null,
        "CM1": null,
        "CM2": null,
        "RM": null,
        "ST1": null,
        "ST2": null
    },
    {
        "GK": null,
        "LB": null,
        "CB1": null,
        "CB2": null,
        "RB": null,
        "CDM": null,
        "CM1": null,
        "CM2": null,
        "LW": null,
        "RW": null,
        "ST": null
    },
    {
        "GK": null,
        "LB": null,
        "CB1": null,
        "CB2": null,
        "RB": null,
        "CM1": null,
        "CM2": null,
        "CM3": null,
        "LW": null,
        "RW": null,
        "ST": null
    },
    {
        "GK": null,
        "LB": null,
        "CB1": null,
        "CB2": null,
        "RB": null,
        "CDM1": null,
        "CDM2": null,
        "CAM": null,
        "LW": null,
        "RW": null,
        "ST": null
    },
    {
        "GK": null,
        "LB": null,
        "CB1": null,
        "CB2": null,
        "CB3": null,
        "RB": null,
        "CM1": null,
        "CM2": null,
        "LW": null,
        "RW": null,
        "ST": null
    }
];

// Estructura de mapeo de posiciones para todas las formaciones
const positionMapping = {
    "GK": "GK",
    "LB": "LB",
    "CB1": "CB",
    "CB2": "CB",
    "CB3": "CB",
    "RB": "RB",
    "CDM": "CDM",
    "CDM1": "CDM",
    "CDM2": "CDM",
    "CM1": "CM",
    "CM2": "CM",
    "CM3": "CM",
    "CAM": "CAM",
    "LM": "LM",
    "RM": "RM",
    "LW": "LW",
    "RW": "RW",
    "ST": "ST",
    "ST1": "ST",
    "ST2": "ST"
};

let formation = {};
let selectedPlayerNationality = ''; // Variable global para almacenar la nacionalidad del jugador seleccionado
let playersCount = 0;
let stop_submitting = false; // Variable para controlar si se rindió o no


let currentCountry = "";
const total_countries = ["France","Norway","Belgium","Argentina","Poland","England","Brazil","Spain","Portugal","Germany","Netherlands","Egypt","Uruguay","Nigeria","Slovenia","Italy","Switzerland","Croatia","Korea Republic","Georgia","Algeria","Senegal","Scotland","Serbia","Cameroon","Costa Rica","Austria","Turkey","Morocco","Ghana","Denmark","Colombia","Hungary","Slovakia","Canada","Czech Republic","Bosnia and Herzegovina","Côte d'Ivoire","Ukraine","Montenegro","Iran","Sweden","Burkina Faso","Mexico","Greece","Tunisia","Japan","Libya","Chile","Finland","Armenia","Central African Republic","Paraguay","Mozambique","Kosovo","North Macedonia","Ecuador","Congo DR","Gabon","Mali","United States","Jamaica","Russia","Malta","Peru","Angola","Australia","Guinea","Suriname","Togo","Albania","Gambia","Israel","Trinidad and Tobago","Zimbabwe","Wales","Venezuela","Saudi Arabia","Romania","Republic of Ireland","Luxembourg","Liberia","Bulgaria","China PR","Iceland","Qatar","Equatorial Guinea","Burundi","Zambia","Cape Verde Islands","Guinea Bissau","Northern Ireland","New Zealand","Kenya","Bolivia","South Africa","Honduras","Comoros","Palestine","Benin","Madagascar","Azerbaijan","Iraq","Cyprus","Liechtenstein","Bermuda","Sierra Leone","Haiti","Philippines","Mauritania","Congo","Panama","United Arab Emirates","Ethiopia","India","Grenada","Curacao"];
const countries = ["France","Norway","Belgium","Argentina","Poland","England","Brazil","Spain","Portugal","Germany","Netherlands","Uruguay","Italy","Switzerland","Croatia","Georgia","Algeria","Senegal","Scotland","Serbia","Austria","Turkey","Morocco","Denmark","Colombia","Canada","Ukraine","Sweden","Mexico","Japan","Chile","Ecuador","United States"];
let usedCountries = [];

function getRandomCountry() {
    const remainingCountries = countries.filter(country => !usedCountries.includes(country));
    if (remainingCountries.length === 0) {
        // Reset the used countries if all have been used
        usedCountries = [];
    }
    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    const selectedCountry = remainingCountries[randomIndex];
    usedCountries.push(selectedCountry);
    return selectedCountry;
}

function getRandomFormation() {
    const randomIndex = Math.floor(Math.random() * formations.length);
    return formations[randomIndex];
}

function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    welcomeScreen.style.display = 'block';

    document.getElementById('start-no-timer').addEventListener('click', function() {
        welcomeScreen.style.display = 'none';
        startGame(); // Llama a startGame sin temporizador
    });

    document.getElementById('start-timer').addEventListener('click', function() {
        welcomeScreen.style.display = 'none';
        startGame(); // Llama a startGame
        startTimer(); // Luego crea el temporizador
    });
}

function startGame() {
    
     // Mostrar los elementos del juego al iniciar
     document.getElementById('game').style.visibility = 'visible';
     document.getElementById('formation').style.visibility = 'visible';

    formation = getRandomFormation();
    currentCountry = getRandomCountry();
    updateCountryFlag(); // Actualiza la bandera del país al inicio
    document.getElementById("country").textContent = `${currentCountry}`;
    document.getElementById("message").textContent = "";
    // Resto del código...
}

function getRandomCountry() {
    const remainingCountries = countries.filter(country => !usedCountries.includes(country));
    if (remainingCountries.length === 0) {
        // Reset the used countries if all have been used
        usedCountries = [];
    }
    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    const selectedCountry = remainingCountries[randomIndex];
    usedCountries.push(selectedCountry);

    // Actualizar la bandera del país antes de devolver el país seleccionado
    currentCountry = selectedCountry;
    updateFormation(); // Actualiza la formación al cambiar de país
    updateCountryFlag(); // Actualiza la bandera del país al cambiar de país

    return selectedCountry;
}

function updateCountryFlag() {
    const countryFlagImg = document.getElementById("country-flag");
    countryFlagImg.src = `img/flags/${currentCountry.toLowerCase()}.png`;
    countryFlagImg.alt = `${currentCountry} flag`;
}



function submitPlayer() {
    // Si ya se rindió, no hacer nada
    if (stop_submitting) {
        return;
    }

    const playerName = normalizeString(document.getElementById("playerInput").value.trim());
    const filteredPlayers = players.filter(p =>
        normalizeString(p.short_name) === playerName || normalizeString(p.long_name) === playerName
    );

    if (filteredPlayers.length === 0) {
        document.getElementById("message").textContent = "Player not found.";
        return;
    }

    const playersInCountry = filteredPlayers.filter(p => p.nationality_name.toLowerCase() === currentCountry.toLowerCase());

    if (playersInCountry.length === 0) {
        document.getElementById("message").textContent = "The player doesn't belong to the selected country.";
        return;
    }

    // Verificar si hay más de un jugador con el mismo nombre en el país
    if (playersInCountry.length > 1) {
        displayPlayerOptions(playerName, playersInCountry);
        return;
    }

    const player = playersInCountry[0];

    // Verificar si el jugador ya está en la formación
    if (Object.values(formation).includes(playerName)) {
        document.getElementById("message").textContent = "The player is already on the formation.";
        return;
    }

    const playerPositions = player.player_positions.split(", ").map(pos => pos.toLowerCase());
    const positions = Object.keys(positionMapping).filter(pos => 
        playerPositions.includes(positionMapping[pos].toLowerCase()) && pos in formation
    );

    if (positions.length === 0) {
        document.getElementById("message").textContent = "This player can't play in any position in this formation.";
        return;
    }

    const availablePositions = positions.filter(pos => !formation[pos]);

    if (availablePositions.length === 1) {
        const pos = availablePositions[0];
        formation[pos] = playerName;
        playerCountryMapping[playerName] = player.nationality_name.toLowerCase(); // Agregar la nacionalidad al mapeo
        updateFormation(pos);
        document.getElementById("playerInput").value = "";
        document.getElementById("message").textContent = "";
        currentCountry = getRandomCountry(); // Selecciona un nuevo país
        document.getElementById("country").textContent = `${currentCountry}`;
    } else {
        const genericPositions = availablePositions.map(pos => positionMapping[pos]);
        const uniqueGenericPositions = [...new Set(genericPositions)];

        if (uniqueGenericPositions.length === 1) {
            const pos = availablePositions[0];
            formation[pos] = playerName;
            playerCountryMapping[playerName] = player.nationality_name.toLowerCase(); // Agregar la nacionalidad al mapeo
            updateFormation(pos);
            document.getElementById("playerInput").value = "";
            document.getElementById("message").textContent = "";
            currentCountry = getRandomCountry(); // Selecciona un nuevo país
            document.getElementById("country").textContent = `${currentCountry}`;
        } else if (availablePositions.length > 1) {
            displayPositionOptions(playerName, player.nationality_name, availablePositions); // Pasar playerName y nationalityName
        } else {
            document.getElementById("message").textContent = "There are no remaingn positions for this player.";
        }
    }
    
}

function displayPlayerOptions(playerName, players) {
    // Crear el popup como un elemento div con la clase "popup"
    const popup = document.createElement("div");
    popup.classList.add("popup");

    // Crear el mensaje dentro del popup
    const message = document.createElement("p");
    message.innerHTML = `Multiple players with the name ${playerName} have been found. Choose one:<br>`;
    popup.appendChild(message);

    // Crear los radio buttons para los jugadores
    players.forEach((player, index) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "playerOption";
        radio.value = index.toString(); // Usar el índice como valor para identificar la selección
        label.appendChild(radio);
        label.appendChild(document.createTextNode(`${player.long_name}`));
        popup.appendChild(label);
        popup.appendChild(document.createElement("br"));
    });

    // Crear el botón de confirmación
    const submitButton = document.createElement("button");
    submitButton.textContent = "Confirm VAR decission";
    submitButton.onclick = () => {
        confirmPlayerOption(playerName, players);
        document.body.removeChild(popup); // Eliminar el popup del DOM
    };    popup.appendChild(submitButton);

    // Asegurarse de eliminar el popup anterior si existe antes de agregar uno nuevo
    const existingPopup = document.querySelector(".popup");
    if (existingPopup) {
        existingPopup.parentNode.removeChild(existingPopup);
    }

    // Agregar el popup al cuerpo del documento
    document.body.appendChild(popup);
    popup.style.display = "block"; // Mostrar el popup
}

function confirmPlayerOption(playerName, players) {
    const selectedOption = document.querySelector('input[name="playerOption"]:checked');
    if (selectedOption) {
        const selectedIndex = parseInt(selectedOption.value, 10);
        const selectedPlayer = players[selectedIndex];
        playerCountryMapping[playerName] = selectedPlayer.nationality_name.toLowerCase(); // Actualizar el mapeo con la nacionalidad del jugador seleccionado

        // Continuar con el proceso para agregar el jugador seleccionado a la formación
        const playerPositions = selectedPlayer.player_positions.split(", ").map(pos => pos.toLowerCase());
        const positions = Object.keys(positionMapping).filter(pos => 
            playerPositions.includes(positionMapping[pos].toLowerCase()) && pos in formation
        );

        if (positions.length === 0) {
            document.getElementById("message").textContent = "The player cannot play in any position in the formation.";
            return;
        }

        const availablePositions = positions.filter(pos => !formation[pos]);

        if (availablePositions.length === 1) {
            const pos = availablePositions[0];
            formation[pos] = playerName;
            updateFormation(pos);
            document.getElementById("playerInput").value = "";
            document.getElementById("message").textContent = "";
            currentCountry = getRandomCountry(); // Selecciona un nuevo país
            document.getElementById("country").textContent = `País: ${currentCountry}`;
        } else {
            displayPositionOptions(playerName, selectedPlayer.nationality_name, availablePositions); // Pasar playerName y nationalityName
        }
    } else {
        document.getElementById("message").textContent = "Please select a player option.";
    }
}


function normalizeString(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function displayPositionOptions(playerName, nationalityName, positions) {
    // Crear el popup como un elemento div con la clase "popup"
    const popup = document.createElement("div");
    popup.classList.add("popup");

    // Crear el mensaje dentro del popup
    const message = document.createElement("p");
    message.textContent = `Choose the position for ${playerName}:`;
    popup.appendChild(message);

    // Crear los radio buttons para las posiciones
    const groupedPositions = groupPositions(positions);
    groupedPositions.forEach(pos => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "position";
        radio.value = pos;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(pos));
        popup.appendChild(label);
    });

    // Crear un salto de línea dentro del popup
    popup.appendChild(document.createElement("br"));

    // Crear el botón de confirmación
    const submitButton = document.createElement("button");
    submitButton.textContent = "Confirm VAR decission";
    submitButton.onclick = () => {
        confirmPosition(playerName, nationalityName); // Pasar playerName y nationalityName
        document.body.removeChild(popup); // Eliminar el popup del DOM
    };    popup.appendChild(submitButton);

    // Asegurarse de eliminar el popup anterior si existe antes de agregar uno nuevo
    const existingPopup = document.querySelector(".popup");
    if (existingPopup) {
        existingPopup.parentNode.removeChild(existingPopup);
    }

    // Agregar el popup al cuerpo del documento
    document.body.appendChild(popup);
    popup.style.display = "block"; // Mostrar el popup
}


function groupPositions(positions) {
    const grouped = {};
    const result = [];

    positions.forEach(pos => {
        const genericPos = positionMapping[pos];
        if (!grouped[genericPos]) {
            grouped[genericPos] = true;
            result.push(genericPos);
        }
    });

    return result;
}

function confirmPosition(playerName, nationalityName) {
    const selectedPosition = document.querySelector('input[name="position"]:checked');
    if (selectedPosition) {
        const genericPos = selectedPosition.value;

        // Filtrar las posiciones específicas que están presentes en la formación actual
        const specificPositions = Object.keys(positionMapping).filter(pos =>
            positionMapping[pos] === genericPos && pos in formation
        );

        // Encontrar la primera posición específica disponible en la formación
        let posToFill = null;
        for (let i = 0; i < specificPositions.length; i++) {
            const pos = specificPositions[i];
            if (!formation[pos]) {
                posToFill = pos;
                break;
            }
        }

        if (posToFill) {
            formation[posToFill] = playerName;
            playerCountryMapping[playerName] = nationalityName.toLowerCase(); // Actualizar el mapeo con la nacionalidad del jugador
            updateFormation(posToFill);
            document.getElementById("playerInput").value = "";
            document.getElementById("message").textContent = "";
            currentCountry = getRandomCountry(); // Selecciona un nuevo país
            document.getElementById("country").textContent = `${currentCountry}`;
        } else {
            document.getElementById("message").textContent = "All player positions are already occupied.";
        }
    } else {
        document.getElementById("message").textContent = "Please select a position.";               
    }
}


function surrender() {
    clearInterval(interval); // Detener el temporizador cuando llegue a cero
    document.getElementById('timer-container').style.display = 'none';
    document.getElementById('playerInput').disabled = true;
    document.querySelector('button[onclick="submitPlayer()"]').disabled = true;
    console.log("¡Perdiste!"); // Mostrar mensaje de perdedor en la consola
    // Puedes mostrar un mensaje en la interfaz gráfica también si lo deseas
    stop_submitting = true; // Marcar como rendido

}

const formationMap = {
    "ST": "attackers",
    "ST1": "attackers",
    "ST2": "attackers",
    "LW": "wingers",
    "RW": "wingers",
    "CAM": "offensiveMidfielders",
    "CM1": "midfielders",
    "CM2": "midfielders",
    "CM3": "midfielders",
    "LM": "wideMidfielders",
    "RM": "wideMidfielders",
    "CDM": "defensiveMidfielders",
    "CDM1": "defensiveMidfielders",
    "CDM2": "defensiveMidfielders",
    "LB": "fullbacks",
    "RB": "fullbacks",
    "LWB": "fullbacks",
    "RWB": "fullbacks",
    "CB1": "defenders",
    "CB2": "defenders",
    "CB3": "defenders",
    "GK": "goalkeeper"
};

const positionOrder = {
    "attackers": ["ST", "ST1", "ST2"],
    "wingers": ["LW", "RW"],
    "offensiveMidfielders": ["CAM"],
    "wideMidfielders": ["LM", "RM"],
    "midfielders": ["CM1", "CM2", "CM3"],
    "defensiveMidfielders": ["CDM", "CDM1", "CDM2"],
    "fullbacks": ["LB", "RB", "LWB", "RWB"],
    "defenders": ["CB1", "CB2", "CB3"],
    "goalkeeper": ["GK"]
};

function generateFormationContainers() {
    const formationDiv = document.getElementById("formation");
    formationDiv.innerHTML = ""; // Clear any existing content

    for (let section in positionOrder) {
        // Check if there are any positions in the section
        if (positionOrder[section].some(pos => pos in formation)) {
            const sectionDiv = document.createElement("div");
            sectionDiv.classList.add("position");
            sectionDiv.id = section;
            formationDiv.appendChild(sectionDiv);
        }
    }
}



// Declarar el mapeo de nacionalidades de los jugadores
const playerCountryMapping = {};

function updateFormation(newPlayerPos = null) {
    generateFormationContainers(); // Genera contenedores necesarios antes de actualizar

    for (let row in positionOrder) {
        const positions = positionOrder[row];
        const sectionDiv = document.getElementById(row);
        if (sectionDiv) {
            sectionDiv.innerHTML = ""; // Limpia el contenido existente
            for (let pos of positions) {
                if (pos in formation) {
                    const player = formation[pos];
                    const card = document.createElement("div");
                    card.classList.add('card');

                    const front = document.createElement("div");
                    front.classList.add('side', 'front');
                    front.textContent = `${pos}`;

                    const back = document.createElement("div");
                    back.classList.add('side', 'back');

                    // Obtener el país actual del jugador
                    const playerCountry = playerCountryMapping[player];

                    // Agregar la bandera al fondo de la carta
                    back.style.backgroundImage = `url('img/flags/${playerCountry}.png')`; // Ajusta la ruta según la estructura de tus archivos de banderas
                    const textContainer = document.createElement("div");
                    textContainer.classList.add('text-container');

                    // Crear la imagen de la bandera al lado del nombre del jugador
                    const flag = document.createElement("img");
                    flag.classList.add('flag');
                    flag.src = `img/flags/${playerCountry}.png`; // Ruta a la bandera del país
                    flag.alt = `${playerCountry} flag`;

                    const playerNameText = document.createElement("span");
                    playerNameText.textContent = `${player}`;
                    textContainer.appendChild(flag); // Agregar la bandera al contenedor de texto
                    textContainer.appendChild(playerNameText);

                    back.appendChild(textContainer);

                    card.appendChild(front);
                    card.appendChild(back);

                    card.id = pos;
                    card.classList.add('position', pos);

                    sectionDiv.appendChild(card);

                    // Si es el nuevo jugador, aplicar la animación
                    if (player && pos === newPlayerPos) {
                        setTimeout(() => {
                            card.classList.add('flipped');
                        }, 100);
                    } else if (player) {
                        // Si no es el nuevo jugador pero tiene jugador, asegurarse que esté flippeado
                        card.classList.add('flipped');
                    }
                }
            }
        }
    }
    // Incrementar el contador de jugadores
    playersCount++;
    console.log(playersCount);
    // Verificar si se han agregado 23 son las veces que se updatea la formacion para 11 jugadores
    if (playersCount >= 23) {
        console.log("¡Ganaste!"); // Mostrar mensaje de ganador en la consola
        // Puedes mostrar un mensaje en la interfaz gráfica también si lo deseas
        document.getElementById('timer-container').style.display = 'none';
    document.getElementById('playerInput').disabled = true;
    document.querySelector('button[onclick="submitPlayer()"]').disabled = true;
        stop_submitting = true; // Marcar como rendido
        clearInterval(interval); // Detener el temporizador si se han completado los 11 jugadores
        fireConfetti();


    }
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
  
    fire(0.35, {
        spread: 26,
        startVelocity: 55,
    });
  
    fire(0.3, {
        spread: 60,
    });
  
    fire(0.45, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });
  
    fire(0.2, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });
  
    fire(0.2, {
        spread: 120,
        startVelocity: 45,
    });
  }
  



function getPlayerCountry(playerName) {
    const player = players.find(p =>
        (normalizeString(p.short_name) === playerName || normalizeString(p.long_name) === playerName) &&
        normalizeString(p.nationality_name) === currentCountry.toLowerCase()
    );
console.log(player);
    return player ? player.nationality_name.toLowerCase() : "";
}


let interval; // Declarar interval en un ámbito superior

function startTimer() {
    document.getElementById('timer-container').style.visibility = 'visible';

    const timerContainer = document.getElementById('timer-container');
    timerContainer.style.display = 'flex'; // Muestra el contenedor del temporizador

    const timerBar = document.getElementById('timer-bar');
    const timerCounter = document.getElementById('timer-counter');

    let timer = 90;
    // Iniciar la animación
    timerBar.classList.add('start');


    interval = setInterval(() => {
        timer--;
        timerCounter.textContent = timer;
        if (timer <= 0) {
            clearInterval(interval);
            // Aquí puedes manejar lo que pasa cuando el tiempo se agota
            console.log("Time's up!");
        }
    }, 1000);
}
function restartGame() {
    startGame();
}

document.addEventListener("DOMContentLoaded", () => {
    showWelcomeScreen(); // Muestra la pantalla de bienvenida

    document.getElementById("playerInput").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Evita el envío del formulario si existe
            submitPlayer();
        }
    });
});

