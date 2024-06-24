
//---------------------------------//
//   GLOBAL VARIABLES              //
//---------------------------------//

var board, wordArr, wordBank, wordsActive, mode;
var cluesArr = [];

var Bounds = {  
  top:0, right:0, bottom:0, left:0,

  Update:function(x,y){
    this.top = Math.min(y,this.top);
    this.right = Math.max(x,this.right);
    this.bottom = Math.max(y,this.bottom);    
    this.left = Math.min(x,this.left);
  },
  
  Clean:function(){
    this.top = 999;
    this.right = 0;
    this.bottom = 0;    
    this.left = 999;
  }
};




//---------------------------------//
//   MAIN                          //
//---------------------------------//


function Play() {
    var letterArr = document.getElementsByClassName('letter');

    for (var i = 0; i < letterArr.length; i++) {
        letterArr[i].innerHTML = "<input class='char' type='text' maxlength='1'></input>";
    }

    var charInputs = document.getElementsByClassName('char');
    for (var j = 0; j < charInputs.length; j++) {
        charInputs[j].addEventListener('input', moveToNextInput);
        charInputs[j].addEventListener('keydown', moveBackOnBackspace);
        charInputs[j].addEventListener('keydown', handleArrowKeys);
    }

    // Store input fields by position
    wordsActive.forEach(word => {
        word.inputs = [];
        for (let i = 0; i < word.char.length; i++) {
            let inputSelector;
            if (word.dir === 0) { // Horizontal
                inputSelector = `.row:nth-child(${word.y - Bounds.top + 2}) > .square:nth-child(${word.x - Bounds.left + i + 2}) .char`;
            } else { // Vertical
                inputSelector = `.row:nth-child(${word.y - Bounds.top + i + 2}) > .square:nth-child(${word.x - Bounds.left + 2}) .char`;
            }
            const inputElement = document.querySelector(inputSelector);
            word.inputs.push(inputElement);
        }
    });

    mode = 0;
    ToggleInputBoxes(false);
    DisplayFirstCells();
    PrintCluesWithIndices();


}


function Create() {
 // Calcular el índice basado en la fecha actual
 offsetFromDate = new Date(2024, 5, 6); // Fecha base
 msOffset = Date.now() - offsetFromDate.getTime(); // Diferencia en milisegundos desde la fecha base
 dayOffset = msOffset / 1000 / 60 / 60 / 24; // Convertir milisegundos a días

fetch('words.json')
  .then(response => response.json())
  .then(data => {
     crucigramasLength = data.crucigramas.length;
     crucigramaIndex = Math.floor(dayOffset) % crucigramasLength; // Índice del crucigrama basado en el offset de días
     console.log("Índice del crucigrama seleccionado:", crucigramaIndex); // Agregar esta línea

    // Ahora que tienes el índice, puedes llamar a GetWordsFromJSON con este índice
    GetWordsFromJSON('words.json', crucigramaIndex, function(selectedCrucigrama) {
      wordArr = selectedCrucigrama.palabras.map(item => item.word.toUpperCase());
      cluesArr = selectedCrucigrama.palabras.map(item => item.clue);

      // Resto del código para crear el crucigrama...
      for (var i = 0, isSuccess = false; i < 10 && !isSuccess; i++) {
        CleanVars();
        isSuccess = PopulateBoard();
      }

      document.getElementById("crossword").innerHTML =
        (isSuccess) ? BoardToHtml(" ") : "Failed to find crossword.";

      Play();
    });
  })
  .catch(error => console.error("Error al cargar el archivo JSON:", error));
}



function GetFirstCellOfWords() {
  let firstCells = [];
  
  wordsActive.forEach(word => {
      firstCells.push({word: word.string, x: word.x, y: word.y});
  });

  return firstCells;
}


// Ejemplo de cómo llamar a la función y mostrar el resultado
function DisplayFirstCells() {
  wordArr.forEach((wordString, index) => {
      let wordObj = wordsActive.find(word => word.string === wordString);
      if (wordObj) {
          let inputSelector;
          if (wordObj.dir === 0) { // Horizontal
              inputSelector = `.row:nth-child(${wordObj.y - Bounds.top + 2}) > .square:nth-child(${wordObj.x - Bounds.left + 2})`;
          } else { // Vertical
              inputSelector = `.row:nth-child(${wordObj.y - Bounds.top + 2}) > .square:nth-child(${wordObj.x - Bounds.left + 2})`;
          }
          const firstCell = document.querySelector(inputSelector);
          if (firstCell) {
              const span = document.createElement('span');
              span.classList.add('letter-index');
              span.textContent = index + 1;
              firstCell.insertBefore(span, firstCell.firstChild); // Insert before any existing content
              console.log(`Index: ${index + 1}, Word: ${wordString}, Clue: ${cluesArr[index]}`);  // Log the index, word, and clue to the console
          }
      }
  });
}

function PrintCluesWithIndices() {
  var cluesContainer = document.getElementById('clues-container');
  cluesContainer.innerHTML = ''; // Clear previous content

  var cluesList = document.createElement('ul');

  cluesArr.forEach((clue, index) => {
    var listItem = document.createElement('li');
    listItem.textContent = `${index + 1}. ${clue}`;
    cluesList.appendChild(listItem);
  });

  cluesContainer.appendChild(cluesList);
}





function ToggleInputBoxes(active){
  var w=document.getElementsByClassName('word'),
      d=document.getElementsByClassName('clue');
  
  for(var i=0;i<w.length; i++){
    if(active===true){
      RemoveClass(w[i], 'hide');
      RemoveClass(d[i], 'clueReadOnly');
      d[i].disabled = '';
    }
    else{
      AddClass(w[i], 'hide');
      AddClass(d[i], 'clueReadOnly');
      d[i].disabled = 'readonly';
    }
  }
}


function GetWordsFromJSON(filename, index, callback) {
  fetch(filename)
    .then(response => response.json())
    .then(data => {
      if (index < 0 || index >= data.crucigramas.length) {
        console.error("Índice fuera de rango");
        return;
      }
      const selectedCrucigrama = data.crucigramas[index];
      callback(selectedCrucigrama);
    })
    .catch(error => console.error("Error al cargar el archivo JSON:", error));
}

function GetWordsFromInput(){
  wordArr = [];  
  for(var i=0,val,w=document.getElementsByClassName("word");i<w.length;i++){
    val = w[i].value.toUpperCase();
    if (val !== null && val.length > 1){wordArr.push(val);}
  }
}


function CleanVars(){
  Bounds.Clean();
  wordBank = [];
  wordsActive = [];
  board = [];
  
  for(var i = 0; i < 32; i++){
    board.push([]);
    for(var j = 0; j < 32; j++){
      board[i].push(null);
    }
  }
}


function PopulateBoard(){
  PrepareBoard();
  
  for(var i=0,isOk=true,len=wordBank.length; i<len && isOk; i++){
    isOk = AddWordToBoard();
  }  
  return isOk;
}


function PrepareBoard(){
  wordBank=[];
  
  for(var i = 0, len = wordArr.length; i < len; i++){
    wordBank.push(new WordObj(wordArr[i]));
  }
  
  for(i = 0; i < wordBank.length; i++){
    for(var j = 0, wA=wordBank[i]; j<wA.char.length; j++){
      for(var k = 0, cA=wA.char[j]; k<wordBank.length; k++){
        for(var l = 0,wB=wordBank[k]; k!==i && l<wB.char.length; l++){
          wA.totalMatches += (cA === wB.char[l])?1:0;
        }
      }
    }
  }  
}


// TODO: Clean this guy up
function AddWordToBoard(){
  var i, len, curIndex, curWord, curChar, curMatch, testWord, testChar, 
      minMatchDiff = 9999, curMatchDiff;  

  if(wordsActive.length < 1){
    curIndex = 0;
    for(i = 0, len = wordBank.length; i < len; i++){
      if (wordBank[i].totalMatches < wordBank[curIndex].totalMatches){
        curIndex = i;
      }
    }
    wordBank[curIndex].successfulMatches = [{x:12,y:12,dir:0}];
  }
  else{  
    curIndex = -1;
    
    for(i = 0, len = wordBank.length; i < len; i++){
      curWord = wordBank[i];
      curWord.effectiveMatches = 0;
      curWord.successfulMatches = [];
      for(var j = 0, lenJ = curWord.char.length; j < lenJ; j++){
        curChar = curWord.char[j];
        for (var k = 0, lenK = wordsActive.length; k < lenK; k++){
          testWord = wordsActive[k];
          for (var l = 0, lenL = testWord.char.length; l < lenL; l++){
            testChar = testWord.char[l];            
            if (curChar === testChar){
              curWord.effectiveMatches++;
              
              var curCross = {x:testWord.x,y:testWord.y,dir:0};              
              if(testWord.dir === 0){                
                curCross.dir = 1;
                curCross.x += l;
                curCross.y -= j;
              } 
              else{
                curCross.dir = 0;
                curCross.y += l;
                curCross.x -= j;
              }
              
              var isMatch = true;
              
              for(var m = -1, lenM = curWord.char.length + 1; m < lenM; m++){
                var crossVal = [];
                if (m !== j){
                  if (curCross.dir === 0){
                    var xIndex = curCross.x + m;
                    
                    if (xIndex < 0 || xIndex > board.length){
                      isMatch = false;
                      break;
                    }
                    
                    crossVal.push(board[xIndex][curCross.y]);
                    crossVal.push(board[xIndex][curCross.y + 1]);
                    crossVal.push(board[xIndex][curCross.y - 1]);
                  }
                  else{
                    var yIndex = curCross.y + m;
                    
                    if (yIndex < 0 || yIndex > board[curCross.x].length){
                      isMatch = false;
                      break;
                    }
                    
                    crossVal.push(board[curCross.x][yIndex]);
                    crossVal.push(board[curCross.x + 1][yIndex]);
                    crossVal.push(board[curCross.x - 1][yIndex]);
                  }

                  if(m > -1 && m < lenM-1){
                    if (crossVal[0] !== curWord.char[m]){
                      if (crossVal[0] !== null){
                        isMatch = false;                  
                        break;
                      }
                      else if (crossVal[1] !== null){
                        isMatch = false;
                        break;
                      }
                      else if (crossVal[2] !== null){
                        isMatch = false;                  
                        break;
                      }
                    }
                  }
                  else if (crossVal[0] !== null){
                    isMatch = false;                  
                    break;
                  }
                }
              }
              
              if (isMatch === true){                
                curWord.successfulMatches.push(curCross);
              }
            }
          }
        }
      }
      
      curMatchDiff = curWord.totalMatches - curWord.effectiveMatches;
      
      if (curMatchDiff<minMatchDiff && curWord.successfulMatches.length>0){
        curMatchDiff = minMatchDiff;
        curIndex = i;
      }
      else if (curMatchDiff <= 0){
        return false;
      }
    }
  }
  
  if (curIndex === -1){
    return false;
  }
    
  var spliced = wordBank.splice(curIndex, 1);
  wordsActive.push(spliced[0]);
  
  var pushIndex = wordsActive.length - 1,
      rand = Math.random(),
      matchArr = wordsActive[pushIndex].successfulMatches,
      matchIndex = Math.floor(rand * matchArr.length),  
      matchData = matchArr[matchIndex];
  
  wordsActive[pushIndex].x = matchData.x;
  wordsActive[pushIndex].y = matchData.y;
  wordsActive[pushIndex].dir = matchData.dir;
  
  for(i = 0, len = wordsActive[pushIndex].char.length; i < len; i++){
    var xIndex = matchData.x,
        yIndex = matchData.y;
    
    if (matchData.dir === 0){
      xIndex += i;    
      board[xIndex][yIndex] = wordsActive[pushIndex].char[i];
    }
    else{
      yIndex += i;  
      board[xIndex][yIndex] = wordsActive[pushIndex].char[i];
    }
    
    Bounds.Update(xIndex,yIndex);
  }
    
  return true;
}


function BoardToHtml(blank){
  for(var i=Bounds.top-1, str=""; i<Bounds.bottom+2; i++){
    str+="<div class='row'>";
    for(var j=Bounds.left-1; j<Bounds.right+2; j++){
      str += BoardCharToElement(board[j][i]);
    }
    str += "</div>";
  }
  return str;
}


function BoardCharToElement(c){
  var arr=(c)?['square','letter']:['square'];
  return EleStr('div',[{a:'class',v:arr}],c);
}



//---------------------------------//
//   OBJECT DEFINITIONS            //
//---------------------------------//

function WordObj(stringValue){
  this.string = stringValue;
  this.char = stringValue.split("");
  this.totalMatches = 0;
  this.effectiveMatches = 0;
  this.successfulMatches = []; 
  this.completed = false; // Nueva propiedad para seguimiento de completado
 
}


//---------------------------------//
//   EVENTS                        //
//---------------------------------//


// Adding event listener for arrow key navigation
document.addEventListener('keydown', function (event) {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        handleArrowKeys(event);
    }
});

function RegisterEvents(){
  document.getElementById("crossword").onfocus = function (){ 
    return false; }
}
RegisterEvents();









//---------------------------------//
//   HELPER FUNCTIONS              //
//---------------------------------//


function moveToNextInput(event) {
  const currentInput = event.target;

  // Find the word that contains the current input
  const word = wordsActive.find(word => word.inputs.includes(currentInput));

  if (word) {
      const currentIndex = word.inputs.indexOf(currentInput);

      // Check if the word is completed
      let wordCompleted = true;
      for (let i = 0; i < word.char.length; i++) {
          const input = word.inputs[i];
          if (input.value.toUpperCase() !== word.char[i].toUpperCase()) {
              wordCompleted = false;
              break;
          }
      }

      if (wordCompleted) {
          word.completed = true;
          handleCompletedWord(word);

          // Change the background color of the inputs of the completed word to light green
          word.inputs.forEach(input => {
              input.classList.add('completed');
              input.addEventListener('keydown', preventBackspaceForCompletedInputs); // Añadir listener de prevención
          });
      }

      // Move to the next input if it exists
      const nextIndex = currentIndex + 1;
      if (nextIndex < word.inputs.length) {
          const nextInput = word.inputs[nextIndex];
          nextInput.focus();
          highlightCurrentWord(nextInput);  
      }
      // Verificar si todas las palabras están completadas
      const allWordsCompleted = wordsActive.every(word => word.completed);
      if (allWordsCompleted) {
          showCompletionMessage();
        }
  }
}
function preventBackspaceForCompletedInputs(event) {
  const currentInput = event.target;
  if (event.key === 'Backspace' && currentInput.classList.contains('completed')) {
      event.preventDefault(); // Previene la acción de borrado
  }
}



function highlightCurrentWord(input) {
    // Remueve la clase 'highlight' de todos los inputs
    const allInputs = document.querySelectorAll('.char');
    allInputs.forEach(input => {
        input.classList.remove('highlight');
    });

    // Añade la clase 'highlight' a todos los inputs de la palabra actual
    const word = wordsActive.find(word => word.inputs.includes(input));
    if (word) {
        word.inputs.forEach(input => {
            input.classList.add('highlight');
        });
    }
}


function handleCompletedWord(word) {
    // Aquí puedes realizar acciones adicionales cuando una palabra se completa
    console.log(`¡La palabra "${word.string}" se ha completado!`);

     // Change the background color of the inputs of the completed word to light green
     word.inputs.forEach(input => {
      input.classList.add('completed');
  });
}

function showCompletionMessage() {
  console.log('¡Felicidades! Has completado todas las palabras del crucigrama.');

  // Eliminar el resaltado de todas las palabras
  wordsActive.forEach(word => {
    word.inputs.forEach(input => {
      input.classList.remove('highlight');
    });
  });

  // Disparar confeti cuando se completan todas las palabras
  fireConfetti();
}

function fireConfetti() {
  const count = 100,
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



function displayWordHint(hint) {
    const hintElement = document.getElementById('word-hint');
    hintElement.textContent = hint; // Assuming there's an element with the ID 'word-hint' to display the hint
}



function moveBackOnBackspace(event) {
  const currentInput = event.target;
  if (event.key === 'Backspace') {
      // Verifica si la palabra asociada está marcada como completada.
      const isWordCompleted = currentInput.classList.contains('completed');
      
      // Si la palabra está completada, no hacer nada.
      if (isWordCompleted) {
          event.preventDefault();
          return; // Salir de la función para evitar borrar o mover el cursor.
      }

      // Si la casilla actual no está vacía, borra su contenido.
      if (currentInput.value !== '') {
          currentInput.value = ''; // Borra el contenido de la casilla actual.
      } else {
          // Si la casilla actual está vacía, mueve el cursor a la casilla anterior.
          const word = wordsActive.find(word => word.inputs.includes(currentInput));
          if (word) {
              const currentIndex = word.inputs.indexOf(currentInput);
              const prevInput = word.inputs[currentIndex - 1];
              if (prevInput) {
                  prevInput.focus();
              }
          }
      }
      event.preventDefault(); // Previene el comportamiento por defecto.
  }
}
// Function to handle arrow key navigation
function handleArrowKeys(event) {
    const currentInput = event.target;
    let nextInput;

    switch (event.key) {
        case 'ArrowRight':
            nextInput = findNextInput(currentInput, 1, 0);
            break;
        case 'ArrowLeft':
            nextInput = findNextInput(currentInput, -1, 0);
            break;
        case 'ArrowDown':
            nextInput = findNextInput(currentInput, 0, 1);
            break;
        case 'ArrowUp':
            nextInput = findNextInput(currentInput, 0, -1);
            break;
    }

    if (nextInput) {
        nextInput.focus();
    }
}

// Function to find the next input in the given direction
function findNextInput(currentInput, dx, dy) {
    const allInputs = Array.from(document.getElementsByClassName('char'));
    const currentRect = currentInput.getBoundingClientRect();
    let closestInput = null;
    let minDistance = Infinity;

    allInputs.forEach(input => {
        const rect = input.getBoundingClientRect();
        const inSameDirection =
            (dx !== 0 && rect.top === currentRect.top && rect.left > currentRect.left && dx > 0) ||
            (dx !== 0 && rect.top === currentRect.top && rect.left < currentRect.left && dx < 0) ||
            (dy !== 0 && rect.left === currentRect.left && rect.top > currentRect.top && dy > 0) ||
            (dy !== 0 && rect.left === currentRect.left && rect.top < currentRect.top && dy < 0);
        if (inSameDirection) {
            const distance = Math.sqrt(
                Math.pow(rect.left - currentRect.left, 2) +
                Math.pow(rect.top - currentRect.top, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestInput = input;
            }
        }
    });

    // Check if current input is at the edge and should not move
    if (dx === 1 && isAtEdge(currentInput, 'right') ||
        dx === -1 && isAtEdge(currentInput, 'left') ||
        dy === 1 && isAtEdge(currentInput, 'down') ||
        dy === -1 && isAtEdge(currentInput, 'up')) {
        return null;
    }

    return closestInput;
}

// Function to check if the current input is at the edge of the crossword grid
function isAtEdge(input, direction) {
    const allInputs = Array.from(document.getElementsByClassName('char'));
    const rect = input.getBoundingClientRect();
    if (direction === 'right') {
        return allInputs.every(inp => inp.getBoundingClientRect().left <= rect.left);
    } else if (direction === 'left') {
        return allInputs.every(inp => inp.getBoundingClientRect().left >= rect.left);
    } else if (direction === 'down') {
        return allInputs.every(inp => inp.getBoundingClientRect().top <= rect.top);
    } else if (direction === 'up') {
        return allInputs.every(inp => inp.getBoundingClientRect().top >= rect.top);
    }
    return false;
}





function EleStr(e,c,h){
  h = (h)?h:"";
  for(var i=0,s="<"+e+" "; i<c.length; i++){
    s+=c[i].a+ "='"+ArrayToString(c[i].v," ")+"' ";    
  }
  return (s+">"+h+"</"+e+">");
}

function ArrayToString(a,s){
  if(a===null||a.length<1)return "";
  if(s===null)s=",";
  for(var r=a[0],i=1;i<a.length;i++){r+=s+a[i];}
  return r;
}

function AddClass(ele,classStr){
  ele.className = ele.className.replaceAll(' '+classStr,'')+' '+classStr;
}

function RemoveClass(ele,classStr){
  ele.className = ele.className.replaceAll(' '+classStr,'');
}

function ToggleClass(ele,classStr){
  var str = ele.className.replaceAll(' '+classStr,'');
  ele.className = (str.length===ele.className.length)?str+' '+classStr:str;
}

String.prototype.replaceAll = function (replaceThis, withThis) {
   var re = new RegExp(replaceThis,"g"); 
   return this.replace(re, withThis);
};




// Other existing functions remain unchanged

//---------------------------------//
//   INITIAL LOAD                  //
//---------------------------------//



document.addEventListener("DOMContentLoaded", function() {
  Create();
  Play();
});