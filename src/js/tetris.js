import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, TETROMINOES, TETROMINO_NAMES, getRandomElement, rotateMatrix } from "./utils";

export class Tetris {
    constructor() {
        this.playfield;
        this.init();
        this.tetromino;
        this.counter = 0;
        this.isGameOver = false;
    }

    init() {
        this.generatePlayfield();
        this.generateTetramino();
    }

    generatePlayfield() {
        this.playfield = new Array(PLAYFIELD_ROWS).fill().map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
    }


    generateTetramino() {
        const name = getRandomElement(TETROMINO_NAMES);
        const matrix = TETROMINOES[name];

        const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
        const row = -2;

        this.tetromino = {
            name,
            matrix,
            column,
            row,
        }
    }

    isOutsideGameBoard(row, column) {
        return this.tetromino.column + column < 0 || this.tetromino.column + column >= PLAYFIELD_COLUMNS || this.tetromino.row + row >= this.playfield.length;
    }

    isValid() {
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (this.isOutsideGameBoard(row, column)) return false;
                if (this.isCollides(row, column)) return false;
            }
        }
        return true;
    }

    isCollides(row, column) {
        return this.playfield[this.tetromino.row + row]?.[this.tetromino.column + column];
    }

    moveTetrominoDown() {
        this.tetromino.row += 1;
        if (!this.isValid()) {
            this.tetromino.row -= 1;
            this.placeTetromino();
        }
    }

    moveTetrominoLeft() {
        this.tetromino.column -= 1;
        if (!this.isValid()) {
            this.tetromino.column += 1;
        }
    }

    moveTetrominoRight() {
        this.tetromino.column += 1;
        if (!this.isValid()) {
            this.tetromino.column -= 1;
        }
    }

    rotateTetromino() {
        const oldMatrix = this.tetromino.matrix;
        const rotatedMatrix = rotateMatrix(this.tetromino.matrix);
        this.tetromino.matrix = rotatedMatrix;

        if (!this.isValid()) {
            this.tetromino.matrix = oldMatrix;
        }
    }

    placeTetromino() {
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (this.isOutsideOfTopBoard(row)) {
                    this.isGameOver = true;
                    return;
                }

                this.playfield[this.tetromino.row + row][this.tetromino.column + column] = this.tetromino.name;
            }
        }

        this.processFilledRows();
        this.generateTetramino();
    }

    isOutsideOfTopBoard(row) {
        return this.tetromino.row + row < 0;
    }

    processFilledRows() {
        const filledLines = this.findFilledRows();
        this.removeFilledRows(filledLines);
    }

    findFilledRows() {
        const filledRows = [];
        for (let row = 0; row < PLAYFIELD_ROWS; row++) {
            if (this.playfield[row].every(cell => Boolean(cell))) {
                filledRows.push(row);
            }
        }

        return filledRows;
    };

    removeFilledRows(filledRows) {
        filledRows.forEach(row => {
            this.dropRowsAbove(row);
        });
    }

    dropRowsAbove(rowToDelete) {
        for (let row = rowToDelete; row > 0; row--) {
            this.playfield[row] = this.playfield[row - 1];
        }
        this.playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
        this.counter += 10;
        console.log(this.counter);
    }

}