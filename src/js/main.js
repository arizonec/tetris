import '../index.html';
import '../assets/styles/style.scss';
import { tetrominoes, tetromino_elements } from './tetrominoes';


const play = document.querySelector('.manage-field__play');
const restart = document.querySelector('.manage-field__restart');

const gameOverText = ['g', 'a', 'm', 'e', ' ', 'o', 'v', 'e', 'r'];

let timeoutId;
let requestId;
let playfield;
let tetromino;
let counter = 0;
let isGameOver = false;
const columns = 10;
const rows = 20;


const createCells = () => {
    const field = document.querySelector('.field');

    for (let i = 0; i < 200; i++) {
        const div = document.createElement('div');
        div.setAttribute('id', i);
        field.append(div);
    }
}

createCells();

const cells = document.querySelectorAll('.field div');



const draw = () => {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayfield();
    drawTetramino();
}

const drawPlayfield = () => {
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            if (!playfield[row][column]) continue;
            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}

const paintFinalText = () => {
    let start = 0;

    for (let id = 83; id < 97; id++) {
        if (id == 87) {
            id = id + 5;
            const elem = document.getElementById(id);
            elem.innerHTML = gameOverText[start];
            start++
        } else {
            const elem = document.getElementById(id);
            elem.innerHTML = gameOverText[start];
            start++
        }
    }
}

const gameOver = () => {
    stopLoop();
    document.removeEventListener('keydown', onKeyDown);
    cells.forEach(cell => cell.removeAttribute('class'));
    paintFinalText();
    setTimeout(() => {
        counter = 0;
        isGameOver = false;
        document.querySelector('.counter').innerHTML = `Score : 0`;
        document.addEventListener('keydown', onKeyDown);
        startLoop();
        cells.forEach(cell => cell.innerHTML = '');
        init();
    }, 3000);
}

const startLoop = () => {
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), 700);
}

const stopLoop = () => {
    cancelAnimationFrame(requestId);
    clearTimeout(timeoutId);
}

const rotateMatrix = (matrix) => {
    const N = matrix.length;
    const rotatedMatrix = [];
    for (let i = 0; i < N; i++) {
        rotatedMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotatedMatrix[i][j] = matrix[N - j - 1][i];
        }
    }
    return rotatedMatrix;
}

const rotate = () => {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    tetromino.matrix = rotatedMatrix;

    if (!isValid()) {
        tetromino.matrix = oldMatrix;
    }
    draw();
}

const moveDown = () => {
    tetromino.startRow += 1;
    if (!isValid()) {
        tetromino.startRow -= 1;
        placeTetromino();
    }
    draw();
    stopLoop();
    startLoop();

    if (isGameOver) {
        gameOver();
    }
}

const moveLeft = () => {
    tetromino.startColumn -= 1;
    if (!isValid()) {
        tetromino.startColumn += 1;
    }
    draw();
}

const moveRight = () => {
    tetromino.startColumn += 1;
    if (!isValid()) {
        tetromino.startColumn -= 1;
    }
    draw();
}

const initKeyDown = () => {
    document.addEventListener('keydown', onKeyDown);
}

const drawTetramino = () => {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetromino.matrix[row][column]) continue;
            if (tetromino.startRow + row < 0) continue;
            const cellIndex = convertPositionToIndex(tetromino.startRow + row, tetromino.startColumn + column);
            cells[cellIndex].classList.add(name);
        }
    }
}





const init = () => {
    generatePlayfield();
    generateTetramino();
}

const generatePlayfield = () => {
    playfield = new Array(rows).fill().map(() => new Array(columns).fill(0));
}


const generateTetramino = () => {
    const name = getRandomElement(tetromino_elements);
    const matrix = tetrominoes[name];

    const startColumn = columns / 2 - Math.floor(matrix.length / 2);
    const startRow = -2;

    tetromino = {
        name,
        matrix,
        startColumn,
        startRow,
    }
}

const isOutsideGameBoard = (row, column) => {
    return tetromino.startColumn + column < 0 || tetromino.startColumn + column >= columns || tetromino.startRow + row >= playfield.length;
}

const isValid = () => {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (!tetromino.matrix[row][column]) continue;
            if (isOutsideGameBoard(row, column)) return false;
            if (playfield[tetromino.startRow + row]?.[tetromino.startColumn + column]) return false;
        }
    }
    return true;
}

const placeTetromino = () => {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (!tetromino.matrix[row][column]) continue;
            if (tetromino.startRow + row < 0) {
                isGameOver = true;
                return;
            }

            playfield[tetromino.startRow + row][tetromino.startColumn + column] = tetromino.name;
        }
    }

    processFilledRows();
    generateTetramino();
}

const processFilledRows = () => {
    const filledLines = findFilledRows();
    removeFilledRows(filledLines);
}

const findFilledRows = () => {
    const filledRows = [];
    for (let row = 0; row < rows; row++) {
        if (playfield[row].every(cell => Boolean(cell))) {
            filledRows.push(row);
        }
    }

    return filledRows;
};

const removeFilledRows = (filledRows) => {
    document.querySelector('.counter').innerHTML = `Score : ${setCounter(filledRows)}`;

    filledRows.forEach(row => {
        dropRowsAbove(row);
    });
}

const dropRowsAbove = (rowToDelete) => {
    for (let row = rowToDelete; row > 0; row--) {
        playfield[row] = playfield[row - 1];
    }
    playfield[0] = new Array(columns).fill(0);
}


const getRandomElement = (array) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
const convertPositionToIndex = (row, column) => {
    return row * columns + column;
}

const onKeyDown = (e) => {
    switch (e.key) {
        case 'ArrowUp':
            rotate();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        default:
            break;
    }
}

const setCounter = (filledRows) => {
    if (filledRows.length == 1) {
        counter += 100
    }
    else if (filledRows.length == 2) {
        counter += 300
    }
    else if (filledRows.length == 3) {
        counter += 700
    }
    else if (filledRows.length == 4) {
        counter += 1500
    }

    return counter;
}

play.addEventListener('click', moveDown);
restart.addEventListener('click', () => {
    counter = 0;
    isGameOver = false;
    document.querySelector('.counter').innerHTML = `Score : 0`;
    document.addEventListener('keydown', onKeyDown);
    startLoop();
    cells.forEach(cell => cell.innerHTML = '');
    init();
});

initKeyDown();

init();
