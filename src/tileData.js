const PIPE_TILES = {
	STRAIGHT_HORIZONTAL: 43,
	STRAIGHT_HORIZONTAL_BAND: 7,
	STRAIGHT_VERTICAL: 26,
	STRAIGHT_VERTICAL_BAND: 24,
	CORNER_TOP_LEFT: 6,
	CORNER_TOP_RIGHT: 8,
	CORNER_BOTTOM_LEFT: 42,
	CORNER_BOTTOM_RIGHT: 44,

	BROKEN_HORIZONTAL_UP: 62,
	BROKEN_HORIZONTAL_DOWN: 25,
	BROKEN_VERTICAL_LEFT: 60,
	BROKEN_VERTICAL_RIGHT: 61,

	RED_GAS_HORIZONTAL_DOWN: 10,
	RED_GAS_HORIZONTAL_UP: 9,
	RED_GAS_VERTICAL_RIGHT: 28,
	RED_GAS_VERTICAL_LEFT: 29,
	BLUE_GAS_HORIZONTAL_DOWN: 14,
	BLUE_GAS_HORIZONTAL_UP: 13,
	BLUE_GAS_VERTICAL_RIGHT: 32,
	BLUE_GAS_VERTICAL_LEFT: 33,
	GREEN_GAS_HORIZONTAL_DOWN: 18,
	GREEN_GAS_HORIZONTAL_UP: 17,
	GREEN_GAS_VERTICAL_RIGHT: 36,
	GREEN_GAS_VERTICAL_LEFT: 37,
	YELLOW_GAS_HORIZONTAL_DOWN: 22,
	YELLOW_GAS_HORIZONTAL_UP: 21,
	YELLOW_GAS_VERTICAL_RIGHT: 34,
	YELLOW_GAS_VERTICAL_LEFT: 33,
};

const PIPE_BROKEN_TILES = {
	red: { up: 9, down: 10, right: 28, left: 29 },
	blue: { up: 13, down: 14, right: 32, left: 33 },
	green: { up: 17, down: 18, right: 36, left: 37 },
	yellow: { up: 21, down: 22, right: 34, left: 35 },
};

const PIPE_BROKEN_LOOKUP = Object.fromEntries(
	Object.entries(PIPE_BROKEN_TILES).flatMap(([color, dirs]) =>
		Object.entries(dirs).map(([dir, tileNum]) => [tileNum, { color, dir }]),
	),
);

const GAS_TILES = {
	RED_GAS_1: 72,
	RED_GAS_2: 73,
	RED_GAS_3: 74,
	RED_GAS_4: 90,
	RED_GAS_5: 91,
	RED_GAS_6: 92,
	RED_GAS_7: 108,
	RED_GAS_8: 109,
	RED_GAS_9: 110,
	GREEN_GAS_1: 81,
	GREEN_GAS_2: 82,
	GREEN_GAS_3: 83,
	GREEN_GAS_4: 103,
	GREEN_GAS_5: 104,
	GREEN_GAS_6: 105,
	GREEN_GAS_7: 125,
	GREEN_GAS_8: 126,
	GREEN_GAS_9: 127,
	YELLOW_GAS_1: 135,
	YELLOW_GAS_2: 136,
	YELLOW_GAS_3: 137,
	YELLOW_GAS_4: 153,
	YELLOW_GAS_5: 154,
	YELLOW_GAS_6: 155,
	YELLOW_GAS_7: 171,
	YELLOW_GAS_8: 172,
	YELLOW_GAS_9: 173,
	BLUE_GAS_1: 126,
	BLUE_GAS_2: 127,
	BLUE_GAS_3: 128,
	BLUE_GAS_4: 144,
	BLUE_GAS_5: 145,
	BLUE_GAS_6: 146,
	BLUE_GAS_7: 162,
	BLUE_GAS_8: 163,
	BLUE_GAS_9: 164,
};

const GROUND_TILES = {
	GROUND_1: 38,
	GROUND_2: 39,
	GROUND_3: 56,
	GROUND_4: 57,
};

const WALL_TILES = {
	WALL_1: 0,
	WALL_2: 1,
	WALL_3: 2,
	WALL_4: 3,
	WALL_5: 4,
	WALL_6: 5,
	WALL_7: 18,
	WALL_8: 19,
	WALL_9: 20,
	WALL_10: 21,
	WALL_11: 22,
	WALL_12: 23,
	WALL_13: 36,
	WALL_14: 37,
	WALL_15: 41,
};

const GAS_TILE_ARRAYS = {
	red: [
		GAS_TILES.RED_GAS_1,
		GAS_TILES.RED_GAS_2,
		GAS_TILES.RED_GAS_3,
		GAS_TILES.RED_GAS_4,
		GAS_TILES.RED_GAS_5,
		GAS_TILES.RED_GAS_6,
		GAS_TILES.RED_GAS_7,
		GAS_TILES.RED_GAS_8,
		GAS_TILES.RED_GAS_9,
	],
	blue: [
		GAS_TILES.BLUE_GAS_1,
		GAS_TILES.BLUE_GAS_2,
		GAS_TILES.BLUE_GAS_3,
		GAS_TILES.BLUE_GAS_4,
		GAS_TILES.BLUE_GAS_5,
		GAS_TILES.BLUE_GAS_6,
		GAS_TILES.BLUE_GAS_7,
		GAS_TILES.BLUE_GAS_8,
		GAS_TILES.BLUE_GAS_9,
	],
	green: [
		GAS_TILES.GREEN_GAS_1,
		GAS_TILES.GREEN_GAS_2,
		GAS_TILES.GREEN_GAS_3,
		GAS_TILES.GREEN_GAS_4,
		GAS_TILES.GREEN_GAS_5,
		GAS_TILES.GREEN_GAS_6,
		GAS_TILES.GREEN_GAS_7,
		GAS_TILES.GREEN_GAS_8,
		GAS_TILES.GREEN_GAS_9,
	],
	yellow: [
		GAS_TILES.YELLOW_GAS_1,
		GAS_TILES.YELLOW_GAS_2,
		GAS_TILES.YELLOW_GAS_3,
		GAS_TILES.YELLOW_GAS_4,
		GAS_TILES.YELLOW_GAS_5,
		GAS_TILES.YELLOW_GAS_6,
		GAS_TILES.YELLOW_GAS_7,
		GAS_TILES.YELLOW_GAS_8,
		GAS_TILES.YELLOW_GAS_9,
	],
};

const gas = (color, index) => GAS_TILE_ARRAYS[color]?.[index];

const GROUND_TILE_ARRAY = [
	GROUND_TILES.GROUND_1,
	GROUND_TILES.GROUND_2,
	GROUND_TILES.GROUND_3,
	GROUND_TILES.GROUND_4,
];
const WALL_TILE_ARRAY = [
	WALL_TILES.WALL_1,
	WALL_TILES.WALL_2,
	WALL_TILES.WALL_3,
	WALL_TILES.WALL_4,
	WALL_TILES.WALL_5,
	WALL_TILES.WALL_6,
	WALL_TILES.WALL_7,
	WALL_TILES.WALL_8,
	WALL_TILES.WALL_9,
	WALL_TILES.WALL_10,
	WALL_TILES.WALL_11,
	WALL_TILES.WALL_12,
	WALL_TILES.WALL_13,
	WALL_TILES.WALL_14,
	WALL_TILES.WALL_15,
];

const ground = (index) => GROUND_TILE_ARRAY[index];
const wall = (index) => WALL_TILE_ARRAY[index];

const GROUND_TILES_RANDOM = [ground(0), ground(1), ground(3), ground(4)];

function groundLayer() {
	const pos = vec2(-16);
	const groundLayer = new TileCollisionLayer(pos, vec2(32));
	groundLayer.renderOrder = -100000;

	for (let y = 1; y < 31; y++) {
		for (let x = 0; x < 32; x++) {
			const isRandomTile = x % 4 || y % 5 || rand() < 0.5;
			let t = isRandomTile ? GROUND_TILES_RANDOM[randInt(0, 3)] : ground(2);

			if (x === 0) {
				t = wall(13);
				groundLayer.setCollisionData(vec2(x, y));
			} else if (x === 31) {
				t = wall(14);
				groundLayer.setCollisionData(vec2(x, y));
			}

			groundLayer.setData(vec2(x, y), getTileData(t));
		}
	}

	for (let x = 1; x < 31; x++) {
		const bottomWallIndex = rand() < 0.2 ? (rand() < 0.5 ? 8 : 10) : 9;

		groundLayer.setCollisionData(vec2(x, 31));
		groundLayer.setData(vec2(x, 31), getTileData(wall(bottomWallIndex)));

		groundLayer.setCollisionData(vec2(x, 0));
		groundLayer.setData(vec2(x, 0), getTileData(wall(3)));
	}

	const cornerWalls = [
		[31, 31, 11],
		[0, 31, 7],
		[31, 0, 4],
		[0, 0, 2],
	];
	for (const [x, y, idx] of cornerWalls) {
		groundLayer.setData(vec2(x, y), getTileData(wall(idx)));
	}

	groundLayer.redraw();
	return groundLayer;
}

function createEmptyGrid(width = 32, height = 32) {
	return Array(height)
		.fill(null)
		.map(() => Array(width).fill(null));
}

function addToGrid(gridData, x, y, value, gridName = "grid") {
	if (x < 0 || x >= gridData[0].length || y < 0 || y >= gridData.length) {
		console.warn(
			`Invalid ${gridName} position: (${x}, ${y}). Must be within bounds.`,
		);
		return gridData;
	}

	gridData[y][x] = value;
	return gridData;
}

function createTileLayer(
	data = null,
	isCollision = false,
	renderOrder = -10000,
	position = vec2(-16),
	size = vec2(32),
) {
	const layerClass = isCollision ? TileCollisionLayer : TileLayer;
	const layer = new layerClass(position, size);
	layer.renderOrder = renderOrder;

	const dataArray = data || createEmptyGrid();

	for (let y = 0; y < size.y; y++) {
		for (let x = 0; x < size.x; x++) {
			const value = dataArray[y][x];
			if (value) {
				const tileIndex =
					typeof value === "object" && value.tile ? value.tile : value;
				const tileData = getTileData(tileIndex);
				layer.setData(vec2(x, y), tileData);
				if (isCollision) layer.setCollisionData(vec2(x, y));
			}
		}
	}

	layer.redraw();
	return layer;
}

const pipe = (type, direction = null, gasColor = "red") => {
	if (type === "straight") {
		const isHorizontal = direction === "horizontal";
		if (gasColor !== "none") {
			return isHorizontal
				? PIPE_TILES[`${gasColor.toUpperCase()}_GAS_HORIZONTAL_DOWN`]
				: PIPE_TILES[`${gasColor.toUpperCase()}_GAS_VERTICAL_RIGHT`];
		}
		return isHorizontal
			? PIPE_TILES.STRAIGHT_HORIZONTAL
			: direction === "vertical"
				? PIPE_TILES.STRAIGHT_VERTICAL
				: PIPE_TILES.STRAIGHT_HORIZONTAL;
	}

	if (type === "corner") {
		const corners = {
			"top-left": PIPE_TILES.CORNER_TOP_LEFT,
			"top-right": PIPE_TILES.CORNER_TOP_RIGHT,
			"bottom-left": PIPE_TILES.CORNER_BOTTOM_LEFT,
			"bottom-right": PIPE_TILES.CORNER_BOTTOM_RIGHT,
		};
		return corners[direction] ?? PIPE_TILES.CORNER_TOP_LEFT;
	}

	if (type === "broken" || type === "leaking") {
		if (gasColor === "none") {
			const brokenPipes = {
				up: PIPE_TILES.BROKEN_HORIZONTAL_UP,
				down: PIPE_TILES.BROKEN_HORIZONTAL_DOWN,
				left: PIPE_TILES.BROKEN_VERTICAL_LEFT,
				right: PIPE_TILES.BROKEN_VERTICAL_RIGHT,
			};
			return brokenPipes[direction] ?? PIPE_TILES.BROKEN_HORIZONTAL_UP;
		}
		const colorKey = gasColor.toUpperCase();
		const gasPipes = {
			up: PIPE_TILES[`${colorKey}_GAS_HORIZONTAL_UP`],
			down: PIPE_TILES[`${colorKey}_GAS_HORIZONTAL_DOWN`],
			left: PIPE_TILES[`${colorKey}_GAS_VERTICAL_LEFT`],
			right: PIPE_TILES[`${colorKey}_GAS_VERTICAL_RIGHT`],
		};
		return gasPipes[direction] ?? PIPE_TILES[`${colorKey}_GAS_VERTICAL_RIGHT`];
	}

	return PIPE_TILES.STRAIGHT_HORIZONTAL;
};
