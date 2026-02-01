// Pipe tile calculation function
pipe = (broken, gas, index) => {
	let w = 18;
	working = [6, 7, 8, 6 + w, 8 + w, 6 + w * 2, 7 + w * 2, 8 + w * 2];
	if (!broken && !gas) return working[index];
	if (broken && !gas) return 7 + w;
};

// Level data for the gas game
const level = {
	pipes: [
		{ x: 16, y: 14, value: pipe(false, false, 1) },
		{ x: 17, y: 14, value: pipe(false, false, 2) },
		{ x: 17, y: 13, value: pipe(false, false, 3) },
		{ x: 14, y: 15, value: pipe(false, false, 4) },
		{ x: 14, y: 14, value: pipe(false, false, 5) },
		{ x: 15, y: 14, value: pipe(false, false, 6) },
		// vertical 
		{ x: 17, y: 12, value: pipe(false, false, 4) },
		{ x: 17, y: 11, value: pipe(false, false, 4) },
		{ x: 17, y: 10, value: pipe(false, false, 4) },
		{ x: 17, y: 9, value: pipe(false, false, 4) },
		{ x: 17, y: 8, value: pipe(false, false, 4) },
		{ x: 17, y: 7, value: pipe(false, false, 4) },
		{ x: 17, y: 6, value: pipe(false, false, 4) },
		{ x: 17, y: 5, value: pipe(false, false, 4) },
		{ x: 17, y: 4, value: pipe(false, false, 4) },
	],
};