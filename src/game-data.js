const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

const MASKS = ["none", "red", "blue", "green", "yellow"];

const PIPE_TILES = {
	// Working pipe tiles
	STRAIGHT_HORIZONTAL: 6,
	STRAIGHT_VERTICAL: 7,
	CORNER_TOP_LEFT: 8,
	CORNER_TOP_RIGHT: 24,
	CORNER_BOTTOM_LEFT: 26,
	CROSS: 42,
	T_TOP: 43,
	T_BOTTOM: 44,
	
	// Broken pipe tiles
	BROKEN_HORIZONTAL_1: 62,
	BROKEN_HORIZONTAL_2: 25,
	BROKEN_VERTICAL_1: 60,
	BROKEN_VERTICAL_2: 61,
	
	// Gas pipe tiles
	GAS_HORIZONTAL_1: 9,
	GAS_HORIZONTAL_2: 45, // 9 + 36
	GAS_VERTICAL_1: 10,
	GAS_VERTICAL_2: 46, // 10 + 36
	GAS_CORNER_TOP_LEFT_1: 27,
	GAS_CORNER_TOP_LEFT_2: 63, // 27 + 36
	GAS_CORNER_TOP_RIGHT_1: 28,
	GAS_CORNER_TOP_RIGHT_2: 64, // 28 + 36
};

const TILE_INDICIES = {
	pipes: {
		working: [PIPE_TILES.STRAIGHT_HORIZONTAL, PIPE_TILES.STRAIGHT_VERTICAL, PIPE_TILES.CORNER_TOP_LEFT, PIPE_TILES.CORNER_TOP_RIGHT, PIPE_TILES.CORNER_BOTTOM_LEFT, PIPE_TILES.CROSS, PIPE_TILES.T_TOP, PIPE_TILES.T_BOTTOM],
		broken: [PIPE_TILES.BROKEN_HORIZONTAL_1, PIPE_TILES.BROKEN_HORIZONTAL_1, PIPE_TILES.BROKEN_HORIZONTAL_2, PIPE_TILES.BROKEN_HORIZONTAL_2, PIPE_TILES.BROKEN_VERTICAL_1, PIPE_TILES.BROKEN_VERTICAL_1, PIPE_TILES.BROKEN_VERTICAL_2, PIPE_TILES.BROKEN_VERTICAL_2],
		red: [PIPE_TILES.GAS_HORIZONTAL_1, PIPE_TILES.GAS_HORIZONTAL_2, PIPE_TILES.GAS_VERTICAL_1, PIPE_TILES.GAS_VERTICAL_2, PIPE_TILES.GAS_CORNER_TOP_LEFT_1, PIPE_TILES.GAS_CORNER_TOP_LEFT_2, PIPE_TILES.GAS_CORNER_TOP_RIGHT_1, PIPE_TILES.GAS_CORNER_TOP_RIGHT_2],
	},
	gas: {
		red: [72, 73, 74, 90, 91, 92, 108, 109, 110],
		blue: [74, 75, 92, 93],
	},
	ground: [38, 39, 56, 57],
	wall: [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 36, 37, 41],
};

const getTileIndex = (category, type, index) => {
	const categoryData = TILE_INDICIES[category];
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

function pipeLine(x, y, length, direction = "horizontal") {
	if (length <= 0) return [];
	
	const value = pipe(false, false, direction === "horizontal" ? 1 : 3);

	let points;
	points = Array.from({ length }, (_, i) => ({
		x: direction === "horizontal" ? x + i : x,
		y: direction === "horizontal" ? y : y + i,
		value,
	}));

	points = points.map((p) => ({ x: p.x, y: p.y, value: p.value }));

	return points;
}

function mazePattern(width, height, startX = 2, startY = 2) {
	const maze = [];
	const cellSize = 3;
	const visited = new Set();
	
	const PIPE_TYPES = [
		PIPE_TILES.STRAIGHT_HORIZONTAL,
		PIPE_TILES.STRAIGHT_VERTICAL,
		PIPE_TILES.CORNER_TOP_LEFT,
		PIPE_TILES.CORNER_TOP_RIGHT,
		PIPE_TILES.CORNER_BOTTOM_LEFT,
		PIPE_TILES.CROSS,
		PIPE_TILES.T_TOP,
		PIPE_TILES.T_BOTTOM
	];
	
	const HORIZONTAL_CONNECTORS = [PIPE_TILES.STRAIGHT_HORIZONTAL, PIPE_TILES.T_TOP, PIPE_TILES.T_BOTTOM];
	const VERTICAL_CONNECTORS = [PIPE_TILES.STRAIGHT_VERTICAL, PIPE_TILES.T_TOP, PIPE_TILES.T_BOTTOM];
	
	function isValid(x, y) {
		return x >= startX && x < startX + width * cellSize && 
			   y >= startY && y < startY + height * cellSize;
	}
	
	function isVisited(x, y) {
		return visited.has(`${x},${y}`);
	}
	
	function getNeighbors(x, y) {
		const neighbors = [];
		const directions = [
			{ dx: 2, dy: 0 },  // right
			{ dx: -2, dy: 0 }, // left
			{ dx: 0, dy: 2 },  // down
			{ dx: 0, dy: -2 }  // up
		];
		
		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;
			if (isValid(nx, ny) && !isVisited(nx, ny)) {
				neighbors.push({ x: nx, y: ny, wallX: x + dx/2, wallY: y + dy/2 });
			}
		}
		return neighbors;
	}
	
	function getRandomPipe(tiles) {
		const tile = tiles[Math.floor(Math.random() * tiles.length)];
		const index = PIPE_TYPES.indexOf(tile);
		return pipe(false, false, index >= 0 ? index : 0);
	}
	
	function dfs(x, y) {
		visited.add(`${x},${y}`);
		
		// Add pipe at current cell
		const pipeType = Math.random() < 0.8 ? 
			getRandomPipe(PIPE_TYPES) : 
			pipe(false, "red", Math.floor(Math.random() * PIPE_TYPES.length));
		maze.push({ x, y, value: pipeType });
		
		const neighbors = getNeighbors(x, y);
		while (neighbors.length > 0) {
			const randomIndex = Math.floor(Math.random() * neighbors.length);
			const neighbor = neighbors[randomIndex];
			neighbors.splice(randomIndex, 1);
			
			if (!isVisited(neighbor.x, neighbor.y)) {
				// Add pipe connecting to neighbor
				const isHorizontal = neighbor.wallX !== x;
				const connectorPipe = getRandomPipe(isHorizontal ? HORIZONTAL_CONNECTORS : VERTICAL_CONNECTORS);
				
				maze.push({ x: neighbor.wallX, y: neighbor.wallY, value: connectorPipe });
				
				dfs(neighbor.x, neighbor.y);
			}
		}
	}
	
	// Start maze generation
	const startXCell = startX;
	const startYCell = startY;
	dfs(startXCell, startYCell);
	
	// Add some random dead ends
	for (let i = 0; i < Math.floor(width * height * 0.3); i++) {
		const rx = startX + Math.floor(Math.random() * width * cellSize);
		const ry = startY + Math.floor(Math.random() * height * cellSize);
		
		if (isValid(rx, ry) && !isVisited(rx, ry)) {
			const pipeType = Math.random() < 0.7 ? 
				getRandomPipe(PIPE_TYPES) : 
				pipe(true, false, Math.floor(Math.random() * PIPE_TYPES.length));
			maze.push({ x: rx, y: ry, value: pipeType });
		}
	}
	
	return maze;
}

const level = {
	pipes: [
		...pipeLine(15, 20, 23),
		...pipeLine(24, 16, 15),
		{ x: 24, y: 16, value: pipe(false, false, 0) },
		...pipeLine(24, 10, 6, "vertical"),
		...mazePattern(5, 5)

	],
	gases: [...cloud(24, 17)],
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
	Object.values(TILE_INDICIES.pipes)
		.flat()
		.forEach((index) => {
			index !== undefined && getTileData(index);
		});

	// Cache all gas tiles
	Object.values(TILE_INDICIES.gas)
		.flat()
		.forEach((index) => {
			index !== undefined && getTileData(index);
		});

	// Cache ground and wall tiles
	TILE_INDICIES.ground.forEach(getTileData);
	TILE_INDICIES.wall.forEach(getTileData);
};

const particles = {
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
