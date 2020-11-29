const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 32;
const rows = 16;
const columns = rows * 2;

const playerOneCells = [[0,0], [0,1], [0,2]];
const playerTwoCells = [[1,1], [2,2], [3,3]];

class Cell {
	constructor(x, y, playerNo) {
		this._x = x;
		this._y = y;
		this.playerNo = playerNo;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	get color() {
		let result;

		if (this.playerNo == 1) {
			result = 'red';
		} else if (this.playerNo == 2) {
			result = 'blue';
		} else {
			result = 'gray';
		}
		
		return result;
	}
}

class Board {
	constructor(playerOneCells, playerTwoCells) {
		this._cells = playerOneCells.map((cell) => new Cell(cell[0], cell[1], 1)).concat(
			playerTwoCells.map((cell) => new Cell(cell[0] + rows, cell[1], 2)));
		}

	get cells() {
		return this._cells;
	}

	draw() {
		this.drawGrid();
		this.drawCells();
	}

	drawGrid() {
		ctx.strokeStyle = '#aaa';

		for (let x = 0.5; x <= cellSize * columns + 0.5; x += cellSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, rows * cellSize + 1);
			ctx.stroke();
		}

		for (let y = 0.5; y <= cellSize * rows + 0.5; y += cellSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(columns * cellSize + 1, y);
			ctx.stroke();
		}
	}

	drawCells() {
		this.cells.forEach((cell) => {
			ctx.beginPath();
			ctx.rect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 1, cellSize - 1);
			ctx.fillStyle = cell.color;
			ctx.fill();
		});
	}

	addCell(cell) {
		this._cells = this.cells.concat(cell);
		this.drawCells();
	}

	findCell(x, y) {
		this.cells.find(cell => cell.x == x && cell.y == y);
	}
}

var board = new Board(playerOneCells, playerTwoCells);

canvas.width = cellSize * columns + 1;
canvas.height = cellSize * rows + 1; 

board.draw();

canvas.addEventListener('click', function(e) {
	const rect = canvas.getBoundingClientRect();
	const x = e.clientX - rect.left, y = e.clientY - rect.top;

	const column = Math.floor(x / cellSize);
	const row = Math.floor(y / cellSize);

	if (!board.findCell(column, row)) {
		board.addCell(new Cell(column, row))
	}
})
