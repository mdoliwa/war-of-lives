const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 32;
const rows = 16;
const columns = rows * 2;

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


