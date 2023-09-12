import '../index.html';
import '../assets/styles/style.scss';
import { Tetris } from './tetris.js';
import { convertPositionToIndex, PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, SAD } from './utils';
const play = document.querySelector('.manage-field__play');
const restart = document.querySelector('.manage-field__restart');

let timeoutId;
let requestId;

const tetris = new Tetris();
const cells = document.querySelectorAll('.field>div');

const draw = () => {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayfield();
    drawTetramino();
}

function drawPlayfield() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (!tetris.playfield[row][column]) continue;
            const name = tetris.playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}


const rotate = () => {
    tetris.rotateTetromino();
    draw();
}

const moveDown = () => {
    tetris.moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();

    if (tetris.isGameOver) {
        gameOver();
    }
}


function gameOverAnimation() {
    const filledCells = [...cells].filter(cell => cell.classList.length > 0);
    filledCells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('hide'), i * 10);
        setTimeout(() => cell.removeAttribute('class'), i * 10 + 500);
    });

    setTimeout(drawSad, filledCells.length * 10 + 1000);
}

function drawSad() {
    const TOP_OFFSET = 5;
    for (let row = 0; row < SAD.length; row++) {
        for (let column = 0; column < SAD[0].length; column++) {
            if (!SAD[row][column]) continue;
            const cellIndex = convertPositionToIndex(TOP_OFFSET + row, column);
            cells[cellIndex].classList.add('sad');
        }
    }
}

const gameOver = () => {
    stopLoop();
    document.removeEventListener('keydown', onKeyDown);
    gameOverAnimation();
}

function startLoop() {
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), 700);
}

play.addEventListener('click', moveDown);
restart.addEventListener('click', () => {
});

function stopLoop() {
    cancelAnimationFrame(requestId);
    clearTimeout(timeoutId);
}

const moveLeft = () => {
    tetris.moveTetrominoLeft();
    draw();
}

const moveRight = () => {
    tetris.moveTetrominoRight();
    draw();
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

const initKeyDown = () => {
    document.addEventListener('keydown', onKeyDown);
}

const drawTetramino = () => {
    const name = tetris.tetromino.name;
    const tetrominoMatrixSize = tetris.tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetris.tetromino.matrix[row][column]) continue;
            if (tetris.tetromino.row + row < 0) continue;
            const cellIndex = convertPositionToIndex(tetris.tetromino.row + row, tetris.tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

initKeyDown();

// moveDown();