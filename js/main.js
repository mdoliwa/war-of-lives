const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 32;
const rows = 16;
const columns = rows * 2;

const playerOneCells = [[0,2], [1,0], [1,2], [2,1], [2,2], [10,2], [11,0], [11,2], [12,1], [12,2], [12,4]];
const playerTwoCells = [[1,2], [1,1], [2,1], [2,2], [3,3],[10,2], [11,0], [11,2], [12,1], [12,2], [11,4]];

class Cell {
	constructor(x, y, playerNo) {
		this._x = x;
		this._y = y;
		this._playerNo = playerNo;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	get playerNo() {
		return this._playerNo;
	}

	get color() {
		let result;

		if (this.playerNo == 1) {
			result = 'red';
		} else if (this.playerNo == 2) {
			result = 'blue';
		} else {
			result = 'lightgray';
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
		ctx.clearRect(0, 0, columns * cellSize, rows * cellSize);
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
			this.drawCell(cell);
		});
	}

	drawCell(cell) {
		ctx.beginPath();
		ctx.rect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 1, cellSize - 1);
		ctx.fillStyle = cell.color;
		ctx.fill();
	}

	findCellIndex(x, y) {
		return this.cells.findIndex(cell => cell.x == x && cell.y == y);
	}

	toggleCell(x, y) {
		var cellIndex = this.findCellIndex(x, y);

		if (cellIndex > -1) {
			this._cells.splice(cellIndex, 1);
			this.deleteCell(x, y);
		} else {
			let newCell = new Cell(x, y, 1);
			this.addCell(newCell);
		}

		this.draw();
	}

	addCell(cell) {
		this._cells = this.cells.concat(cell);
	}

	deleteCell(x, y) {
		delete this.cells[this.findCellIndex(x, y)];
	}
}

class Game {
	constructor(playerOneCells, playerTwoCells) {
		this._board = new Board(playerOneCells, playerTwoCells);
	}

	get board() {
		return this._board;
	}

	init() {
		this.board.draw();
	}

	loop() {
		var that = this;
		var intervalId = setInterval(function(){
			that.tick();
			that.board.draw();
			if (that.isOver()) {
				clearInterval(intervalId);
			}
		}, 100);
	}

	tick() {
		var neighbors = {};

		this.board.cells.forEach(cell => {
			let keys = [
				[(cell.x - 1).mod(columns), (cell.y - 1).mod(rows)],
				[(cell.x - 1).mod(columns), (cell.y).mod(rows)],
				[(cell.x - 1).mod(columns), (cell.y + 1).mod(rows)],
				[(cell.x + 1).mod(columns), (cell.y - 1).mod(rows)],
				[(cell.x + 1).mod(columns), (cell.y).mod(rows)],
				[(cell.x + 1).mod(columns), (cell.y + 1).mod(rows)],
				[(cell.x).mod(columns), (cell.y - 1).mod(rows)],
				[(cell.x).mod(columns), (cell.y + 1).mod(rows)]
			]

			keys.forEach(key => {
				if (neighbors[key]) {
					neighbors[key] = neighbors[key].concat(cell);
				} else {
					neighbors[key] = [cell];
				}
			});
		});

		let newBoard = new Board([], []);

		this.board.cells.forEach(cell => {
			if (neighbors[[cell.x, cell.y]] && (neighbors[[cell.x, cell.y]].length == 2 || neighbors[[cell.x, cell.y]].length == 3)) {
				newBoard.addCell(cell);
			}
			delete neighbors[[cell.x, cell.y]];
		});

		Object.entries(neighbors).forEach(([coordinates, cells]) => {
			if (cells.length == 3) {
				let x = coordinates.split(',')[0], y = coordinates.split(',')[1];
				let playerNo;

				if (cells.filter(cell => cell.playerNo == 1).length > 1) {
					playerNo = 1;
				} else if (cells.filter(cell => cell.playerNo == 2).length > 2) {
					playerNo = 2;
				} 
				newBoard.addCell(new Cell(parseInt(x), parseInt(y), playerNo));
			}
		});
		
		this._board = newBoard;
	}

	isOver() {
		return !(this.board.cells.find(cell => cell.playerNo == 1) && this.board.cells.find(cell => cell.playerNo == 2))
	}
}

canvas.width = cellSize * columns + 1;
canvas.height = cellSize * rows + 1; 

var game = new Game(playerOneCells, playerTwoCells)

game.init();
game.loop();

//Event listeners

canvas.addEventListener('click', function(e) {
	const rect = canvas.getBoundingClientRect();
	const x = e.clientX - rect.left, y = e.clientY - rect.top;

	const column = Math.floor(x / cellSize);
	const row = Math.floor(y / cellSize);

	game.board.toggleCell(column, row);
})

//Utils

Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
}
