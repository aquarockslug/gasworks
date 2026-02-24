const PIPE_TILES = {
	STRAIGHT_HORIZONTAL: 43,
	STRAIGHT_HORIZONTAL_BAND: 7,
	STRAIGHT_VERTICAL: 26,
	STRAIGHT_VERTICAL_BAND: 24,
	CORNER_TOP_LEFT: 6,
	CORNER_TOP_RIGHT: 8,
	CORNER_BOTTOM_LEFT: 42,
	CORNER_BOTTOM_RIGHT: 44,

	BROKEN_HORIZONTAL_1: 62,
	BROKEN_HORIZONTAL_2: 25,
	BROKEN_VERTICAL_1: 60,
	BROKEN_VERTICAL_2: 61,

	RED_GAS_HORIZONTAL_DOWN: 10,
	RED_GAS_HORIZONTAL_UP: 9,
	RED_GAS_VERTICAL_RIGHT: 28,
	RED_GAS_VERTICAL_LEFT: 29, // WARN
};

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

const gas = (color, index) => {
	const redGasTiles = [
		GAS_TILES.RED_GAS_1,
		GAS_TILES.RED_GAS_2,
		GAS_TILES.RED_GAS_3,
		GAS_TILES.RED_GAS_4,
		GAS_TILES.RED_GAS_5,
		GAS_TILES.RED_GAS_6,
		GAS_TILES.RED_GAS_7,
		GAS_TILES.RED_GAS_8,
		GAS_TILES.RED_GAS_9,
	];
	const blueGasTiles = [
		GAS_TILES.BLUE_GAS_1,
		GAS_TILES.BLUE_GAS_2,
		GAS_TILES.BLUE_GAS_3,
		GAS_TILES.BLUE_GAS_4,
	];

	const gasTiles = { red: redGasTiles, blue: blueGasTiles };
	return gasTiles[color]?.[index];
};

const ground = (index) => {
	const groundTiles = [
		GROUND_TILES.GROUND_1,
		GROUND_TILES.GROUND_2,
		GROUND_TILES.GROUND_3,
		GROUND_TILES.GROUND_4,
	];
	return groundTiles[index];
};

const wall = (index) => {
	const wallTiles = [
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
	return wallTiles[index];
};

const pipe = (type, direction = null, hasGas = false, gasFrame = 1) => {
	if (type === "straight") {
		if (hasGas) {
			if (direction === "horizontal") {
				return gasFrame === 1
					? PIPE_TILES.RED_GAS_HORIZONTAL_DOWN_1
					: gasFrame === 2
						? PIPE_TILES.RED_GAS_HORIZONTAL_DOWN_2
						: 1;
			} else if (direction === "vertical") {
				return gasFrame === 1
					? PIPE_TILES.RED_GAS_VERTICAL_1
					: PIPE_TILES.RED_GAS_VERTICAL_2;
			}
		} else {
			return direction === "horizontal"
				? PIPE_TILES.STRAIGHT_HORIZONTAL
				: direction === "vertical"
					? PIPE_TILES.STRAIGHT_VERTICAL
					: PIPE_TILES.STRAIGHT_HORIZONTAL;
		}
	} else if (type === "corner") {
		if (hasGas) {
			if (direction === "top-left") {
				return gasFrame === 1
					? PIPE_TILES.RED_GAS_CORNER_TOP_LEFT_1
					: PIPE_TILES.RED_GAS_CORNER_TOP_LEFT_2;
			} else if (direction === "top-right") {
				return gasFrame === 1
					? PIPE_TILES.RED_GAS_CORNER_TOP_RIGHT_1
					: PIPE_TILES.RED_GAS_CORNER_TOP_RIGHT_2;
			}
		} else {
			return direction === "top-left"
				? PIPE_TILES.CORNER_TOP_LEFT
				: direction === "top-right"
					? PIPE_TILES.CORNER_TOP_RIGHT
					: direction === "bottom-left"
						? PIPE_TILES.CORNER_BOTTOM_LEFT
						: direction === "bottom-right"
							? PIPE_TILES.CORNER_BOTTOM_RIGHT
							: PIPE_TILES.CORNER_TOP_LEFT;
		}
	} else if (type === "broken") {
		return direction === "up"
			? PIPE_TILES.RED_GAS_HORIZONTAL_UP
			: direction === "down"
				? PIPE_TILES.RED_GAS_HORIZONTAL_DOWN
				: direction === "left"
					? PIPE_TILES.RED_GAS_VERTICAL_LEFT
					: direction === "right"
						? PIPE_TILES.RED_GAS_VERTICAL_RIGHT
						: PIPE_TILES.CORNER_VERTICAL_LEFT;
	} else if (type === "leaking") {
		return direction === "up"
			? PIPE_TILES.RED_GAS_HORIZONTAL_UP
			: direction === "down"
				? PIPE_TILES.RED_GAS_HORIZONTAL_DOWN
				: direction === "left"
					? PIPE_TILES.RED_GAS_VERTICAL_LEFT
					: direction === "right"
						? PIPE_TILES.RED_GAS_VERTICAL_RIGHT
						: PIPE_TILES.RED_GAS_VERTICAL_RIGHT;
	}
	return PIPE_TILES.STRAIGHT_HORIZONTAL;
};
