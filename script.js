// Configuración
const words = ['JAVASCRIPT', 'HTML', 'CSS', 'WEB', 'CODIGO', 'PROGRAMACION', 'ALGORITMO', 'FUNCION', 'VARIABLE'];
const gridSize = 15;
let grid = [];
let selectedCells = [];
let foundWords = [];

// Elementos del DOM
const wordSearchTable = document.getElementById('wordSearch');
const wordListContainer = document.getElementById('wordListContainer');
const generateBtn = document.getElementById('generateBtn');

// Event listeners
generateBtn.addEventListener('click', generateWordSearch);

// Funciones principales
function generateWordSearch() {
    // Inicializar grid vacío
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    foundWords = [];
    
    // Llenar el grid con letras aleatorias
    fillGridWithRandomLetters();
    
    // Colocar palabras en el grid
    placeWords();
    
    // Renderizar
    renderGrid();
    renderWordList();
}

function fillGridWithRandomLetters() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = letters.charAt(Math.floor(Math.random() * letters.length));
        }
    }
}

function placeWords() {
    words.forEach(word => {
        placeWordInGrid(word);
    });
}

function placeWordInGrid(word) {
    const directions = [
        {x: 1, y: 0},   // Horizontal
        {x: 0, y: 1},    // Vertical
        {x: 1, y: 1}     // Diagonal
    ];
    
    let placed = false;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!placed && attempts < maxAttempts) {
        attempts++;
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const xStart = Math.floor(Math.random() * (gridSize - word.length * direction.x));
        const yStart = Math.floor(Math.random() * (gridSize - word.length * direction.y));
        
        if (canPlaceWord(word, xStart, yStart, direction)) {
            placeWordAtLocation(word, xStart, yStart, direction);
            placed = true;
        }
    }
}

function canPlaceWord(word, xStart, yStart, direction) {
    for (let i = 0; i < word.length; i++) {
        const x = xStart + i * direction.x;
        const y = yStart + i * direction.y;
        if (grid[y][x] !== '' && grid[y][x] !== word[i]) {
            return false;
        }
    }
    return true;
}

function placeWordAtLocation(word, xStart, yStart, direction) {
    for (let i = 0; i < word.length; i++) {
        const x = xStart + i * direction.x;
        const y = yStart + i * direction.y;
        grid[y][x] = word[i];
    }
}

// Renderizado
function renderGrid() {
    wordSearchTable.innerHTML = '';
    
    for (let i = 0; i < gridSize; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < gridSize; j++) {
            const cell = createGridCell(i, j);
            row.appendChild(cell);
        }
        wordSearchTable.appendChild(row);
    }
}

function createGridCell(row, col) {
    const cell = document.createElement('td');
    cell.textContent = grid[row][col];
    cell.dataset.row = row;
    cell.dataset.col = col;
    
    cell.addEventListener('mousedown', handleMouseDown);
    cell.addEventListener('mouseover', handleMouseOver);
    cell.addEventListener('mouseup', handleMouseUp);
    
    return cell;
}

function renderWordList() {
    wordListContainer.innerHTML = `
        <div id="wordList">
            <h3>Palabras a encontrar:</h3>
            <ul>
                ${words.map(word => `
                    <li id="word-${word}" class="${foundWords.includes(word) ? 'found' : ''}">
                        ${word}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// Manejo de selección
function handleMouseDown(e) {
    selectedCells = [{
        row: parseInt(e.target.dataset.row),
        col: parseInt(e.target.dataset.col)
    }];
}

function handleMouseOver(e) {
    if (selectedCells.length > 0) {
        const currentRow = parseInt(e.target.dataset.row);
        const currentCol = parseInt(e.target.dataset.col);
        
        if (isValidSelection(currentRow, currentCol)) {
            updateSelection(currentRow, currentCol);
        }
    }
}

function isValidSelection(currentRow, currentCol) {
    const rowDiff = currentRow - selectedCells[0].row;
    const colDiff = currentCol - selectedCells[0].col;
    
    return (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && 
           !selectedCells.some(cell => cell.row === currentRow && cell.col === currentCol);
}

function updateSelection(currentRow, currentCol) {
    clearSelection();
    
    const rowDiff = currentRow - selectedCells[0].row;
    const colDiff = currentCol - selectedCells[0].col;
    const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
    let r = selectedCells[0].row;
    let c = selectedCells[0].col;
    selectedCells = [];
    
    while (true) {
        selectedCells.push({row: r, col: c});
        if (r === currentRow && c === currentCol) break;
        r += stepRow;
        c += stepCol;
    }
    
    highlightSelection();
}

function handleMouseUp() {
    if (selectedCells.length > 1) {
        checkSelectedWord();
    }
    selectedCells = [];
}

function clearSelection() {
    document.querySelectorAll('#wordSearch td').forEach(cell => {
        cell.classList.remove('selected');
    });
}

function highlightSelection() {
    selectedCells.forEach(cell => {
        const cellElement = document.querySelector(`#wordSearch td[data-row="${cell.row}"][data-col="${cell.col}"]`);
        cellElement.classList.add('selected');
    });
}

function checkSelectedWord() {
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if (words.includes(selectedWord)) {
        markWordAsFound(selectedWord);
    } else if (words.includes(reversedWord)) {
        markWordAsFound(reversedWord);
    }
}

function markWordAsFound(word) {
    if (!foundWords.includes(word)) {
        foundWords.push(word);
        
        // Actualizar lista de palabras
        const wordElement = document.getElementById(`word-${word}`);
        if (wordElement) {
            wordElement.classList.add('found');
            wordElement.style.textDecoration = 'line-through';
            wordElement.style.color = 'green';
        }
        
        // Resaltar celdas
        selectedCells.forEach(cell => {
            const cellElement = document.querySelector(`#wordSearch td[data-row="${cell.row}"][data-col="${cell.col}"]`);
            cellElement.classList.add('found');
        });
        
        // Verificar si se encontraron todas
        checkAllWordsFound();
    }
}

function checkAllWordsFound() {
    if (foundWords.length === words.length) {
        setTimeout(() => {
            alert('¡Felicidades! Has encontrado todas las palabras.');
        }, 500);
    }
}

// Inicialización
window.addEventListener('DOMContentLoaded', generateWordSearch);