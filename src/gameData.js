const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

// biome-ignore format: sfx
const sfx = {
	walk:  new Sound([2,,459,.01,.01,.002,3,2,,,,,,,15,.1,.22,.83,.01]),
	lever: new Sound([,,191,.02,.01,.07,3,3.5,,,,,,.5,,.4,,.86,.01])
}

const MASKS = ["none", "red", "blue", "green", "yellow"];

const cloud = (color, corner1, corner2) => {
	const g = (x, y, index) => ({
		x: x,
		y: y,
		value: { tile: gas(color, index), animSpeed: 4, frames: 4 },
	});
	const corners = [
		g(corner1.x, corner1.y, 0), // upper left
		g(corner2.x, corner2.y, 8), // lower right
		g(corner1.x, corner2.y, 6), // lower left
		g(corner2.x, corner1.y, 2), // upper right
	];
	// top is index 1, left side is index 3, right side is index 5, bottom is index 7
	const top = Array.from({ length: corner2.x - corner1.x - 1 }, (_, i) =>
		g(corner1.x + 1 + i, corner1.y, 1),
	);
	const bottom = Array.from({ length: corner2.x - corner1.x - 1 }, (_, i) =>
		g(corner1.x + 1 + i, corner2.y, 7),
	);
	const left = Array.from({ length: corner1.y - corner2.y - 1 }, (_, i) =>
		g(corner1.x, corner2.y + 1 + i, 3),
	);
	const right = Array.from({ length: corner1.y - corner2.y - 1 }, (_, i) =>
		g(corner2.x, corner2.y + 1 + i, 5),
	);
	const sides = [...top, ...left, ...right, ...bottom];
	const center = Array.from({ length: corner1.y - corner2.y - 1 }, (_, y) =>
		Array.from({ length: corner2.x - corner1.x - 1 }, (_, x) =>
			g(corner1.x + 1 + x, corner2.y + 1 + y, 4),
		),
	).flat();
	return [...corners, ...sides, ...center];
};

function pipeSection(x, y, length, direction = "horizontal") {
	if (length <= 0) return [];

	const straightValue =
		direction === "horizontal"
			? PIPE_TILES.STRAIGHT_HORIZONTAL
			: PIPE_TILES.STRAIGHT_VERTICAL;
	const bandValue =
		direction === "horizontal"
			? PIPE_TILES.STRAIGHT_HORIZONTAL_BAND
			: PIPE_TILES.STRAIGHT_VERTICAL_BAND;

	let points = Array.from({ length }, (_, i) => {
		const isBand = (i === 0 || i === length - 1) && length > 1;
		const value = isBand ? bandValue : straightValue;
		return {
			x: direction === "horizontal" ? x + i : x,
			y: direction === "horizontal" ? y : y + i,
			value,
		};
	});

	return points.map((p) => ({ x: p.x, y: p.y, value: p.value }));
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
			pipeline.push(pipeSection(start.x, startY, length, "vertical"));
		} else if (start.y === end.y) {
			const length = Math.abs(end.x - start.x);
			const startX = Math.min(start.x, end.x);
			pipeline.push(pipeSection(startX, start.y, length, "horizontal"));
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
			if (prev.x < curr.x && next.y > curr.y)
				cornerTile = PIPE_TILES.CORNER_BOTTOM_RIGHT;
			else if (prev.x < curr.x && next.y < curr.y)
				cornerTile = PIPE_TILES.CORNER_TOP_RIGHT;
			else if (prev.x > curr.x && next.y > curr.y)
				cornerTile = PIPE_TILES.CORNER_BOTTOM_LEFT;
			else if (prev.x > curr.x && next.y < curr.y)
				cornerTile = PIPE_TILES.CORNER_TOP_LEFT;
		}
		// Vertical to horizontal turn
		else if (prev.x === curr.x && curr.y === next.y) {
			if (prev.y < curr.y && next.x > curr.x)
				cornerTile = PIPE_TILES.CORNER_TOP_LEFT;
			else if (prev.y < curr.y && next.x < curr.x)
				cornerTile = PIPE_TILES.CORNER_TOP_RIGHT;
			else if (prev.y > curr.y && next.x > curr.x)
				cornerTile = PIPE_TILES.CORNER_BOTTOM_LEFT;
			else if (prev.y > curr.y && next.x < curr.x)
				cornerTile = PIPE_TILES.CORNER_BOTTOM_RIGHT;
		}

		if (cornerTile) {
			pipeline.push({ x: curr.x, y: curr.y, value: cornerTile });
		}
	}

	return pipeline.flat();
}

function mazePattern(width, height, startX = 2, startY = 2) {
	const path = [];
	const cellSize = 4;
	const visited = new Set();

	const isValid = (x, y) =>
		x >= startX &&
		x < startX + width * cellSize &&
		y >= startY &&
		y < startY + height * cellSize;
	const isVisited = (x, y) => visited.has(`${x},${y}`);

	const getNeighbors = (x, y) => {
		const dirs = [
			{ dx: 4, dy: 0 },
			{ dx: -4, dy: 0 },
			{ dx: 0, dy: 4 },
			{ dx: 0, dy: -4 },
		];
		return dirs
			.filter(({ dx, dy }) => {
				const nx = x + dx,
					ny = y + dy;
				return isValid(nx, ny) && !isVisited(nx, ny);
			})
			.map(({ dx, dy }) => ({ x: x + dx, y: y + dy }));
	};

	const dfs = (x, y) => {
		visited.add(`${x},${y}`);
		path.push({ x, y });

		const neighbors = getNeighbors(x, y);
		while (neighbors.length) {
			const idx = Math.floor(Math.random() * neighbors.length);
			const neighbor = neighbors.splice(idx, 1)[0];

			if (!isVisited(neighbor.x, neighbor.y)) {
				dfs(neighbor.x, neighbor.y);
			}
		}
	};

	dfs(startX, startY);

	// Create additional random paths for complexity
	for (let i = 0; i < Math.floor(width * height * 0.05); i++) {
		const rx = startX + Math.floor(Math.random() * width * cellSize);
		const ry = startY + Math.floor(Math.random() * height * cellSize);
		if (isValid(rx, ry) && !isVisited(rx, ry)) {
			// Find nearest visited cell to connect to
			let minDist = Infinity;
			let nearestCell = null;
			for (const cell of path) {
				const dist = Math.abs(cell.x - rx) + Math.abs(cell.y - ry);
				if (dist < minDist && dist <= 8) {
					minDist = dist;
					nearestCell = cell;
				}
			}
			if (nearestCell) {
				path.push({ x: rx, y: ry });
				path.push(nearestCell);
			}
		}
	}

	return pipeLine(path);
}

// Pre-create TileLayerData objects for performance
const TILE_DATA_CACHE = {};

const getTileData = (tileIndex) => {
	if (!TILE_DATA_CACHE[tileIndex]) {
		TILE_DATA_CACHE[tileIndex] = new TileLayerData(tileIndex);
	}
	return TILE_DATA_CACHE[tileIndex];
};

function emitGas(position, gas) {
	if (!gas || !gas.emitterData) {
		console.error("Invalid gas object provided");
		return null;
	}

	const emitterConfig = [...gas.emitterData];
	emitterConfig[0] = position;

	gas.emitter = new ParticleEmitter(...emitterConfig);
	gas.emitter.renderOrder = -500;
	return gas;
}

const initTileDataCache = () => {
	Object.values(PIPE_TILES).forEach((index) => {
		index !== undefined && getTileData(index);
	});
	Object.values(GAS_TILES).forEach((index) => {
		index !== undefined && getTileData(index);
	});
	Object.values(GROUND_TILES).forEach(getTileData);
	Object.values(WALL_TILES).forEach(getTileData);
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
