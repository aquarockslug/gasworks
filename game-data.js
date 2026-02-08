const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

const MASKS = ["none", "red", "blue", "green", "yellow"];

const TILE_INDEXES = {
	pipes: {
		working: [6, 7, 8, 24, 26, 42, 43, 44],
		broken: [62, 62, 25, 25, 60, 60, 61, 61],
		red: [9, 9 + 36, 10, 10 + 36, 27, 27 + 36, 28, 28 + 36],
	},
	gas: {
		red: [72, 73, 74, 90, 91, 92, 108, 109, 110],
		blue: [74, 75, 92, 93],
	},
	ground: [38, 39, 56, 57],
	wall: [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 36, 37, 38],
};

const getTileIndex = (category, type, index) => {
	const categoryData = TILE_INDEXES[category];
	if (!categoryData) return undefined;

	return typeof categoryData === "object" && !Array.isArray(categoryData)
		? categoryData[type]?.[index]
		: categoryData[index];
};

const pipe = (broken, gas, index) =>
	!broken && !gas
		? getTileIndex("pipes", "working", index)
		: broken && !gas
			? getTileIndex("pipes", "broken", index)
			: broken && gas
				? getTileIndex("pipes", gas, index)
				: undefined;

const gas = (color, index) => getTileIndex("gas", color, index);

const ground = (index) => getTileIndex("ground", null, index);

const wall = (index) => getTileIndex("wall", null, index);

const cloud = (x, y) => [
	{ x: x, y: y, value: { tile: gas("red", 6), animSpeed: 4, frames: 4 } },
	{ x: x + 1, y: y, value: { tile: gas("red", 7), animSpeed: 4, frames: 4 } },
	{ x: x + 2, y: y, value: { tile: gas("red", 8), animSpeed: 4, frames: 4 } },
	{ x: x, y: y + 1, value: { tile: gas("red", 3), animSpeed: 4, frames: 4 } },
	{
		x: x + 1,
		y: y + 1,
		value: { tile: gas("red", 4), animSpeed: 4, frames: 4 },
	},
	{
		x: x + 2,
		y: y + 1,
		value: { tile: gas("red", 5), animSpeed: 4, frames: 4 },
	},
	{ x: x, y: y + 2, value: { tile: gas("red", 0), animSpeed: 4, frames: 4 } },
	{
		x: x + 1,
		y: y + 2,
		value: { tile: gas("red", 1), animSpeed: 4, frames: 4 },
	},
	{
		x: x + 2,
		y: y + 2,
		value: { tile: gas("red", 2), animSpeed: 4, frames: 4 },
	},
];

function pipeLine(x, y, length, value = 1) {
	if (length <= 0) return [];

	// Use the provided value or default to pipe(false, false, 1)
	const tileValue = value !== undefined ? value : pipe(false, false, 1);

	// Create an array of coordinates for a horizontal line
	return Array.from({ length }, (_, i) => ({
		x: x + i,
		y: y,
		value,
	}));
}

level = {
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
		{ x: 15, y: 14, value: pipe(false, false, 6) },
		{ x: 14, y: 20, value: pipe(false, false, 0) },
		...pipeLine(15, 20, 23, pipe(false, false, 6)),
		{ x: 16, y: 20, value: pipe(false, false, 1) },
		{ x: 17, y: 12, value: pipe(false, false, 4) },
		{ x: 17, y: 11, value: pipe(false, false, 4) },
		{ x: 17, y: 10, value: pipe(false, false, 4) },
		{ x: 17, y: 9, value: pipe(false, false, 4) },
		{ x: 17, y: 8, value: pipe(false, false, 4) },
		{ x: 17, y: 7, value: pipe(false, false, 4) },
		{ x: 17, y: 6, value: pipe(false, false, 4) },
		{ x: 17, y: 5, value: pipe(false, false, 4) },
	],
	gases: [...cloud(21, 17)],
};

// Pre-create TileLayerData objects for performance
const TILE_DATA_CACHE = {};

const getTileData = (tileIndex) => {
	if (!TILE_DATA_CACHE[tileIndex]) {
		TILE_DATA_CACHE[tileIndex] = new TileLayerData(tileIndex);
	}
	return TILE_DATA_CACHE[tileIndex];
};

// Pre-cache commonly used tile data
const initTileDataCache = () => {
	// Cache all pipe tiles
	Object.values(TILE_INDEXES.pipes)
		.flat()
		.forEach((index) => {
			index !== undefined && getTileData(index);
		});

	// Cache all gas tiles
	Object.values(TILE_INDEXES.gas)
		.flat()
		.forEach((index) => {
			index !== undefined && getTileData(index);
		});

	// Cache ground and wall tiles
	TILE_INDEXES.ground.forEach(getTileData);
	TILE_INDEXES.wall.forEach(getTileData);
};

particles = {
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
			PI / 3, // emitSize, emitTime, rate, cone
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
			PI / 4,
			0.9, // damp, angleDamp, gravity, particleCone, fade
			0.2,
			1,
			0,
			1, // randomness, collide, additive, colorLinear
		],
		effects: (player) => ({}),
	},
};
