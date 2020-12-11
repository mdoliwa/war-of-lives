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
}

class GameState {
	name = 'init'
	level = 1
	boardHistory = []
	currentBoard = new Board()

	get initialPlayerCells() {
		return this._initialPlayerCells || []
	}

	set initialPlayerCells(cells) {
		this._initialPlayerCells = cells
		this.currentBoard.playerCells = cells

		this.currentBoard.draw()
	}

	get initialOpponentCells() {
		return this._initialOpponentCells || []
	}

	set initialOpponentCells(cells) {
		this._initialOpponentCells = cells
		this.currentBoard.opponentCells = cells

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

	loadOpponentCells(level) {
		let cells = []

		for (let x = 0; x < columns; x++) {
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
	}
}

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const cellSize = 32 
const	rows = 16 
const	columns = rows * 2

game = new Game()
game.init()
