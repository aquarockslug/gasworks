const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

const MASKS = ["none", "red", "blue", "green", "yellow"];

pipe = (broken, gas, index) => {
	let w = 18;
	workingPipes = [6, 7, 8, 6 + w, 8 + w, 6 + w * 2, 7 + w * 2, 8 + w * 2];
	brokenPipes = [7 + w];
	if (!broken && !gas) return workingPipes[index];
	if (broken && !gas) return brokenPipes[index];

};

ground = (index) => [38, 39, 38 + 18, 39 + 18][index];
wall = (index) =>
	[
		0,
		1,
		2,
		3,
		4,
		5,
		18,
		1 + 18,
		2 + 18,
		3 + 18,
		4 + 18,
		5 + 18,
		36,
		1 + 36,
		2 + 36,
	][index];

const level = {
	pipes: [
		{ x: 16, y: 14, value: pipe(false, false, 1) },
		{ x: 17, y: 14, value: pipe(false, false, 2) },
		{ x: 17, y: 13, value: pipe(false, false, 3) },
		{ x: 14, y: 15, value: pipe(false, false, 4) },
		{ x: 14, y: 14, value: pipe(false, false, 5) },
		{ x: 14, y: 16, value: pipe(false, false, 4) },
		{ x: 14, y: 17, value: pipe(false, false, 4) },
		{ x: 14, y: 18, value: pipe(false, false, 4) },
		{ x: 14, y: 19, value: pipe(false, false, 4) },
		{ x: 14, y: 20, value: pipe(false, false, 0) },
		{ x: 15, y: 20, value: pipe(false, false, 1) },
		{ x: 16, y: 20, value: pipe(false, false, 6) },
		{ x: 17, y: 20, value: pipe(false, false, 6) },
		{ x: 18, y: 20, value: pipe(true, false, 0) },
		{ x: 19, y: 20, value: pipe(false, false, 6) },
		{ x: 20, y: 20, value: pipe(false, false, 6) },
		{ x: 21, y: 20, value: pipe(false, false, 6) },
		{ x: 15, y: 14, value: pipe(false, false, 6) },
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

gases = {
	square: {
		emitterData: [
			vec2(0, 0),
			0, // pos, angle
			1,
			undefined,
			100,
			PI, // emitSize, emitTime, rate, cone
			0, // tileInfo
			rgb(0, 0, 1, 0.5),
			hsl(0, 0, 1, 0.5), // colorStartA, colorStartB
			hsl(1, 0, 0, 0),
			hsl(0, 0, 1, 0), // colorEndA, colorEndB
			1,
			1,
			5,
			0.2,
			0.01, // time, sizeStart, sizeEnd, speed, angleSpeed
			0.85,
			1,
			-1,
			PI,
			0.3, // damp, angleDamp, gravity, particleCone, fade
			0.5,
			0,
			0,
			1, // randomness, collide, additive, colorLinear
		],
		effects: (player) => ({}),
	},
	triangle: {
		emitterData: [
			vec2(0, 0),
			0, // pos, angle
			1,
			undefined,
			100,
			PI, // emitSize, emitTime, rate, cone
			0, // tileInfo
			rgb(1, 0, 0, 0.5),
			hsl(0, 0, 1, 0.5), // colorStartA, colorStartB
			hsl(1, 0, 0, 0),
			hsl(0, 0, 1, 0), // colorEndA, colorEndB
			1,
			1,
			5,
			0.2,
			0.01, // time, sizeStart, sizeEnd, speed, angleSpeed
			0.85,
			1,
			-1,
			PI,
			0.3, // damp, angleDamp, gravity, particleCone, fade
			0.5,
			0,
			0,
			1, // randomness, collide, additive, colorLinear
		],
		effects: (player) => ({}),
	},
	dust: {
		emitterData: [
			vec2(0, 0),
			0, // pos, angle
			0.3,
			0.2,
			30,
			PI/3, // emitSize, emitTime, rate, cone
			0, // tileInfo
			rgb(0.6, 0.4, 0.2, 0.7),
			rgb(0.7, 0.5, 0.3, 0.7), // colorStartA, colorStartB
			hsl(0.1, 0.3, 0.3, 0),
			hsl(0.1, 0.2, 0.2, 0), // colorEndA, colorEndB
			0.4,
			0.05,
			0.08,
			0.03,
			0.01, // time, sizeStart, sizeEnd, speed, angleSpeed
			0.95,
			0.9,
			0.05,
			PI/4,
			0.9, // damp, angleDamp, gravity, particleCone, fade
			0.2,
			1,
			0,
			1, // randomness, collide, additive, colorLinear
		],
		effects: (player) => ({}),
	},
};
