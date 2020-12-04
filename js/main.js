const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 32;
const rows = 16;
const columns = rows * 2;

const playerOneCells = [[2,2], [3,3], [4,2], [4,4], [6,7], [5,6], [5,5]];
const playerTwoCells = [[2,2], [2,3], [2,4]];

class Cell {
	constructor(x, y, playerNo) {
		this.x = x;
		this.y = y;
		this.playerNo = playerNo;
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
	constructor(cells) {
		this.cells = cells;
	}

	draw() {
		this.drawGrid();
		this.drawCells();
	}

	get playerOneCells() {
		return this.cells.filter(cell => cell.playerNo == 1).map(cell => [cell.x, cell.y]);
	}

	get playerTwoCells() {
		return this.cells.filter(cell => cell.playerNo == 2).map(cell => [cell.x - rows, cell.y]) ;
	}

	 set playerOneCells(cells) {
		 this.cells = this.cells.filter(cell => cell.playerNo != 1);
		 cells.forEach(cell => this.cells = this.cells.concat(new Cell(cell[0], cell[1], 1)));

		 this.cells = this.cells.sort();
	 }

	set playerTwoCells(cells) {
		 this.cells = this.cells.filter(cell => cell.playerNo != 2);
		 cells.forEach(cell => this.cells = this.cells.concat(new Cell(cell[0] + rows, cell[1], 2)));

		 this.cells = this.cells.sort();
	}

	drawGrid() {
		ctx.clearRect(0, 0, columns * cellSize + 1, rows * cellSize + 1);
		ctx.strokeStyle = '#aaa';

		for (let x = 0.5; x <= columns * cellSize + 0.5; x += cellSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, rows * cellSize + 1);
			ctx.stroke();
		}

		for (let y = 0.5; y <= rows * cellSize+ 0.5; y += cellSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(columns * cellSize + 1, y);
			ctx.stroke();
		}
	}

	drawCells() { this.cells.forEach((cell) => { this.drawCell(cell) }); }

	drawCell(cell) {
		ctx.beginPath();
		ctx.rect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 1, cellSize - 1);
		ctx.fillStyle = cell.color;
		ctx.fill();
	}

	toggleCell(x, y) {
		var cellIndex = this.findCellIndex(x, y);

		if (cellIndex > -1) {
			this.deleteCell(x, y);
		} else {
			this.addCell(new Cell(x, y, 1));
		}

		this.draw();
	}

	findCellIndex(x, y) {
		return this.cells.findIndex(cell => cell.x == x && cell.y == y);
	}

	addCell(cell) {
		this.cells = this.cells.concat(cell).sort();
	}

	deleteCell(x, y) {
		this.cells.splice(this.findCellIndex(x, y), 1);
	}
}

class GameEngine {
	nextBoard(board) {
		var neighbors = {};

		board.cells.forEach(cell => {
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

		let newBoard = new Board([]);

		board.cells.forEach(cell => {
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

		return newBoard;
	}
}

class Game {
	constructor(playerOneCells, playerTwoCells) {
		this.initBoard(playerOneCells, playerTwoCells);
		this.history = [JSON.stringify(this.board)]
		this.state = 'initialized';
		this.observers = [];
	}

	initBoard(playerOneCells, playerTwoCells) {
		this.playerOneCells = playerOneCells;
		this.playerTwoCells = playerTwoCells;

		this.board = new Board([]);
		this.board.playerOneCells = playerOneCells;
		this.board.playerTwoCells = playerTwoCells;
	}

	init() {
		this.board.draw();
		this.notify();
	}

	subscribe(observer) {
		this.observers.push(observer);
	}
	
	updateState(newState) {
		this.state = newState;
		this.notify();
	}

	notify() {
		this.observers.forEach(observer => observer.update(this.state));
	}

	loop() {
		var that = this;
		this.updateState('in progress');

		var intervalId = setInterval(function(){
			that.tick();
			that.board.draw();
			if (that.isOver() || that.cycleDetected()) {
				that.updateState('game over');
				clearInterval(intervalId);
			}
			that.history = that.history.concat(JSON.stringify(that.board));
		}, 100);
	}

	restart() {
		this.initBoard(this.playerOneCells, this.playerTwoCells);
		this.history = [JSON.stringify(this.board)];
		this.updateState('initialized');
		this.init();
	}

	tick() {
		let gameEngine = new GameEngine;
		this.board = gameEngine.nextBoard(this.board);
	}

	isOver() {
		return !(this.board.cells.find(cell => cell.playerNo == 1) && this.board.cells.find(cell => cell.playerNo == 2))
	}

	cycleDetected() {
		return this.history.includes(JSON.stringify(this.board));
	}

	winner() {
		let playerOneHasCells = this.board.cells.find(cell => cell.playerNo == 1);
		let playerTwoHasCells = this.board.cells.find(cell => cell.playerNo == 2);

		if (playerOneHasCells && playerTwoHasCells) {
			return 'draw';
		} else if (playerOneHasCells) {
			return 'player one';
		} else if (playerTwoHasCells) {
			return 'player two';
		} 	
	}
}

class Menu {
	constructor() {
		this.playButton = document.getElementById('start');
		this.restartButton = document.getElementById('restart');
	}

	update(gameState) {
		switch(gameState) {
			case 'initialized': 
				this.playButton.style.display = 'inline-block';
				this.playButton.disabled = false;
				this.restartButton.style.display = 'none';
				break;
			case 'in progress':
				this.playButton.disabled = true;
				break;
			case 'game over':
				this.playButton.style.display = 'none';
				this.restartButton.style.display = 'inline-block';
				break;
		}
	}
}

canvas.width = cellSize * columns + 1;
canvas.height = cellSize * rows + 1; 

var game = new Game(playerOneCells, playerTwoCells)

game.subscribe(new Menu());

game.init();

//Event listeners

canvas.addEventListener('click', function(e) {
	const rect = canvas.getBoundingClientRect();
	const x = e.clientX - rect.left, y = e.clientY - rect.top;

	const column = Math.floor(x / cellSize);
	const row = Math.floor(y / cellSize);

	game.board.toggleCell(column, row);
	game.initBoard(game.board.playerOneCells, game.board.playerTwoCells);
})

document.getElementById('start').addEventListener('click', function(e) {
	game.loop();
})

document.getElementById('restart').addEventListener('click', function(e) {
	game.restart();
})

//Utils

Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
}
