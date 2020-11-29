const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 32;
const rows = 16;
const columns = rows * 2;

const playerOneCells = [[0,0], [0,1], [0,2]];
const playerTwoCells = [[1,1], [2,2], [3,3]];

var board = initBoard(playerOneCells, playerTwoCells);

canvas.width = cellSize * columns + 1;
canvas.height = cellSize * rows + 1; 

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

board.forEach((cell) => setCell(cell[0], cell[1]));

canvas.addEventListener('click', function(e) {
	const rect = canvas.getBoundingClientRect();
	const x = e.clientX - rect.left, y = e.clientY - rect.top;

	const column = Math.floor(x / cellSize);
	const row = Math.floor(y / cellSize);

	if (row >= rows || column >= columns) { return }

	setCell(column, row)
})

function setCell(x, y) {
	ctx.beginPath();
	ctx.rect(x * cellSize + 1, y * cellSize + 1, cellSize - 1, cellSize - 1);
	ctx.fill();
}

function initBoard(playerOneCells, playerTwoCells) {
	return playerOneCells.concat(playerTwoCells.map((cell) => [cell[0] + rows, cell[1]]));
}
