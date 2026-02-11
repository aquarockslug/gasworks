const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

const MASKS = ["none", "red", "blue", "green", "yellow"];

const PIPE_TILES = {
	STRAIGHT_HORIZONTAL: 43,
	STRAIGHT_VERTICAL: 26,
	CORNER_TOP_LEFT: 6,
	CORNER_TOP_RIGHT: 8,
	CORNER_BOTTOM_LEFT: 42,
	CORNER_BOTTOM_RIGHT: 44,

	BROKEN_HORIZONTAL_1: 62,
	BROKEN_HORIZONTAL_2: 25,
	BROKEN_VERTICAL_1: 60,
	BROKEN_VERTICAL_2: 61,

	GAS_HORIZONTAL_1: 9,
	GAS_HORIZONTAL_2: 45, // 9 + 36
	GAS_VERTICAL_1: 10,
	GAS_VERTICAL_2: 46, // 10 + 36
	GAS_CORNER_TOP_LEFT_1: 27,
	GAS_CORNER_TOP_LEFT_2: 63, // 27 + 36
	GAS_CORNER_TOP_RIGHT_1: 28,
	GAS_CORNER_TOP_RIGHT_2: 64, // 28 + 36
};





const gas = (color, index) => {
	const gasTiles = {
		red: [72, 73, 74, 90, 91, 92, 108, 109, 110],
		blue: [74, 75, 92, 93]
	};
	return gasTiles[color]?.[index];
};

const ground = (index) => {
	const groundTiles = [38, 39, 56, 57];
	return groundTiles[index];
};

const wall = (index) => {
	const wallTiles = [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 36, 37, 41];
	return wallTiles[index];
};

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

function pipe(x, y, length, direction = "horizontal") {
	if (length <= 0) return [];

	const value = direction === "horizontal" ? PIPE_TILES.STRAIGHT_HORIZONTAL : PIPE_TILES.STRAIGHT_VERTICAL;

	let points;
	points = Array.from({ length }, (_, i) => ({
		x: direction === "horizontal" ? x + i : x,
		y: direction === "horizontal" ? y : y + i,
		value,
	}));

	points = points.map((p) => ({ x: p.x, y: p.y, value: p.value }));

	return points;
}

function pipeLine(coordinates) {
	if (coordinates.length < 2) return [];
	
	const pipeline = [];
	
	for (let i = 0; i < coordinates.length - 1; i++) {
		const start = coordinates[i];
		const end = coordinates[i + 1];
		
		if (start.x === end.x) {
			const length = Math.abs(end.y - start.y);
			const startY = Math.min(start.y, end.y);
			pipeline.push(pipe(start.x, startY, length, "vertical"));
		} else if (start.y === end.y) {
			const length = Math.abs(end.x - start.x);
			const startX = Math.min(start.x, end.x);
			pipeline.push(pipe(startX, start.y, length, "horizontal"));
		}
	}
	
	// Add corner pieces at coordinate junctions
	for (let i = 1; i < coordinates.length - 1; i++) {
		const prev = coordinates[i - 1];
		const curr = coordinates[i];
		const next = coordinates[i + 1];
		
		let cornerTile = null;
		
		// Horizontal to vertical turn
		if (prev.y === curr.y && curr.x === next.x) {
			if (prev.x < curr.x && next.y > curr.y) cornerTile = PIPE_TILES.CORNER_BOTTOM_RIGHT;
			else if (prev.x < curr.x && next.y < curr.y) cornerTile = PIPE_TILES.CORNER_TOP_RIGHT;
			else if (prev.x > curr.x && next.y > curr.y) cornerTile = PIPE_TILES.CORNER_BOTTOM_LEFT;
			else if (prev.x > curr.x && next.y < curr.y) cornerTile = PIPE_TILES.CORNER_TOP_LEFT;
		}
		// Vertical to horizontal turn
		else if (prev.x === curr.x && curr.y === next.y) {
			if (prev.y < curr.y && next.x > curr.x) cornerTile = PIPE_TILES.CORNER_BOTTOM_LEFT;
			else if (prev.y < curr.y && next.x < curr.x) cornerTile = PIPE_TILES.CORNER_TOP_RIGHT;
			else if (prev.y > curr.y && next.x > curr.x) cornerTile = PIPE_TILES.CORNER_TOP_LEFT;
			else if (prev.y > curr.y && next.x < curr.x) cornerTile = PIPE_TILES.CORNER_BOTTOM_RIGHT;
		}
		
		if (cornerTile) {
			pipeline.push({ x: curr.x, y: curr.y, value: cornerTile });
		}
	}
	
	return pipeline.flat();
}

function mazePattern(width, height, startX = 2, startY = 2) {
	const maze = [];
	const cellSize = 8;
	const visited = new Set();
	const straightPipe = PIPE_TILES.STRAIGHT_HORIZONTAL;

	const isValid = (x, y) => x >= startX && x < startX + width * cellSize && y >= startY && y < startY + height * cellSize;
	const isVisited = (x, y) => visited.has(`${x},${y}`);
	const getRandomPipe = (tiles) => tiles[Math.floor(Math.random() * tiles.length)];

	const getNeighbors = (x, y) => {
		const dirs = [{ dx: 2, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: 2 }, { dx: 0, dy: -2 }];
		return dirs.filter(({ dx, dy }) => {
			const nx = x + dx, ny = y + dy;
			return isValid(nx, ny) && !isVisited(nx, ny);
		}).map(({ dx, dy }) => ({ x: x + dx, y: y + dy, wallX: x + dx/2, wallY: y + dy/2 }));
	};

	const dfs = (x, y) => {
		visited.add(`${x},${y}`);
		maze.push({ x, y, value: straightPipe });

		const neighbors = getNeighbors(x, y);
		while (neighbors.length) {
			const idx = Math.floor(Math.random() * neighbors.length);
			const neighbor = neighbors.splice(idx, 1)[0];

			if (!isVisited(neighbor.x, neighbor.y)) {
				const isHorizontal = neighbor.wallX !== x;
				const connector = getRandomPipe(isHorizontal ? [straightPipe] : [PIPE_TILES.STRAIGHT_VERTICAL]);
				maze.push({ x: neighbor.wallX, y: neighbor.wallY, value: connector });
				dfs(neighbor.x, neighbor.y);
			}
		}
	};

	dfs(startX, startY);

	for (let i = 0; i < Math.floor(width * height * 0.3); i++) {
		const rx = startX + Math.floor(Math.random() * width * cellSize);
		const ry = startY + Math.floor(Math.random() * height * cellSize);
		if (isValid(rx, ry) && !isVisited(rx, ry)) {
			maze.push({ x: rx, y: ry, value: straightPipe });
		}
	}

	return maze;
}

const level = {
	pipes: [
		...pipe(15, 20, 23),
		...pipe(24, 16, 15),
		{ x: 24, y: 16, value: PIPE_TILES.CORNER_TOP_LEFT },
		...pipe(24, 10, 6, "vertical"),
		...pipeLine([{x: 1, y: 5}, {x: 15, y: 5}, {x: 15, y: 12}, {x: 5, y: 12}, {x: 5, y: 18}]),
		// ...mazePattern(2, 2)

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
	Object.values(PIPE_TILES).forEach((index) => {
		index !== undefined && getTileData(index);
	});

	// Cache all gas tiles
	const gasTiles = [72, 73, 74, 90, 91, 92, 108, 109, 110, 74, 75, 92, 93];
	gasTiles.forEach((index) => {
		index !== undefined && getTileData(index);
	});

	// Cache ground and wall tiles
	const groundTiles = [38, 39, 56, 57];
	const wallTiles = [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 36, 37, 41];

	groundTiles.forEach(getTileData);
	wallTiles.forEach(getTileData);
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
