class Cell {
	constructor(x, y, playerNo) {
		this.x = x
		this.y = y
		this.playerNo = playerNo
	}

	get color() {
		let result

		if (this.playerNo == 1) {
			result = '#DC2626'
		} else if (this.playerNo == 2) {
			result = '#2563EB'
		} else {
			result = 'lightgray'
		}
		
		return result
	}
}

class Board {
	constructor(cells) {
		this.cells = cells || []
	}

	draw() {
		this.drawBackground()
		this.drawGrid()
		this.drawCells()
	}

	 set playerCells(cells) {
		 this.cells = this.cells.filter(cell => cell.playerNo != 1)
		 cells.forEach(cell => this.cells = this.cells.concat(new Cell(cell[0], cell[1], 1)))

		 this.cells = this.cells.sort()
	 }

	set opponentCells(cells) {
		 this.cells = this.cells.filter(cell => cell.playerNo != 2)
		 cells.forEach(cell => this.cells = this.cells.concat(new Cell(cell[0] + rows, cell[1], 2)))

		 this.cells = this.cells.sort()
	}

	drawBackground() {
		ctx.clearRect(0, 0, columns * cellSize + 1, rows * cellSize + 1)
		ctx.fillStyle = '#FEF2F2'

		ctx.fillRect(0, 0, columns * cellSize / 2, rows * cellSize)
		ctx.fillStyle = '#EFF6FF'

		ctx.fillRect(columns * cellSize / 2, 0, columns * cellSize / 2, rows * cellSize)
		ctx.strokeStyle = '#aaa'
	}

	drawGrid() {
		for (let x = 0.5; x <= columns * cellSize + 0.5; x += cellSize) {
			ctx.beginPath()
			ctx.moveTo(x, 0)
			ctx.lineTo(x, rows * cellSize + 1)
			ctx.stroke()
		}

		for (let y = 0.5; y <= rows * cellSize+ 0.5; y += cellSize) {
			ctx.beginPath()
			ctx.moveTo(0, y)
			ctx.lineTo(columns * cellSize + 1, y)
			ctx.stroke()
		}
	}

	drawCells() { this.cells.forEach((cell) => { this.drawCell(cell) }); }

	drawCell(cell) {
		ctx.beginPath()
		ctx.rect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 1, cellSize - 1)
		ctx.fillStyle = cell.color
		ctx.fill()
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

class GameState {
	name = 'init'
	level = 1
	boardHistory = []
	currentBoard = new Board()
	gameEngine = new GameEngine()

	get initialPlayerCells() {
		return this._initialPlayerCells || []
	}

	set initialPlayerCells(cells) {
		let filteredCells = cells.filter(cell => cell[0] < columns / 2 && cell[1] < rows)

		this._initialPlayerCells = filteredCells 
		this.currentBoard.playerCells = filteredCells

		this.currentBoard.draw()
	}

	get initialOpponentCells() {
		return this._initialOpponentCells || []
	}

	set initialOpponentCells(cells) {
		let filteredCells = cells.filter(cell => cell[0] < columns / 2 && cell[1] < rows)

		this._initialOpponentCells = filteredCells 
		this.currentBoard.opponentCells = filteredCells

		this.currentBoard.draw()
	}

	tick() {
		this.currentBoard = this.gameEngine.nextBoard(this.currentBoard)

		this.currentBoard.draw()
	}
}

class Game {
	gameState = new GameState()

	constructor() {
		canvas.width = cellSize * columns + 1
		canvas.height = cellSize * rows + 1
	}

	init() {
		this.gameState.initialOpponentCells = this.loadOpponentCells(this.gameState.level)
		this.setEventListeners()
	}

	loop() {
		setInterval(() => this.gameState.tick(), 100)
	}

	tick() {
		this.gameState.tick()
	}

	loadOpponentCells(level) {
		let cells = []

		for (let x = 0; x < columns / 2; x++) {
			for (let y = 0; y < rows; y++ ) {
				if (Math.random() > 0.7) {
					cells = cells.concat([[x, y]])
				}
			}
		}

		return cells
	}

	setEventListeners() {
		let that = this

		canvas.addEventListener('click', function(e) {
			if (that.gameState.name != 'init') { return }

			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left, y = e.clientY - rect.top;

			const column = Math.floor(x / cellSize);
			const row = Math.floor(y / cellSize);

			if (column >= columns / 2 || row >= rows) { return }

			if (that.gameState.initialPlayerCells.find(cell => cell[0] == column && cell[1] == row)) {
				that.gameState.initialPlayerCells = that.gameState.initialPlayerCells.filter(cell => !(cell[0] == column && cell[1] == row))
			} else {
				that.gameState.initialPlayerCells = that.gameState.initialPlayerCells.concat([[column, row]])
			}
		})

		document.getElementById('start').addEventListener('click', function(e) {
			that.loop();
		})
	}
}

Math.seedrandom('war-of-lives')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const cellSize = 32 
const	rows = 16 
const	columns = rows * 2

game = new Game()
game.init()

//Utils

Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
}

