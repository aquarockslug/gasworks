// biome-ignore format: sfx
const sfx = {
	walk: new Sound([2, , 459, 0.01, 0.01, 0.002, 3, 2, , , , , , , 15, 0.1, 0.22, 0.83, 0.01,]),
	lever: new Sound([, , 191, 0.02, 0.01, 0.07, 3, 3.5, , , , , 0.5, , 0.4, , 0.86, 0.01, ]),
	gas: new Sound([ 1.3, , 98, 0.03, 0.15, 0.23, 4, 1.1, 1.9, -4, , 0.01, -0.02, 1.4, 1, 0.4, 0.25, 0.41, 0.11, , 1367, ]), // Explosion 61 - Mutation 5
	victory: new Sound([ , , 595, 0.09, 0.11, 0.32, , 2.7, , , -151, 0.12, , , , , , 0.53, 0.27, ]), // Powerup 67
	mask: new Sound([ 1.1, , 796, 0.02, 0.01, 0.04, 2, 1.6, 27, -25, , , , , , 0.1, , 0.67,]), // Blip 79
};

const MASKS = ["none", "red", "blue", "green", "yellow"];
const TILE_DATA_CACHE = {};

const getTileData = (tileIndex) => {
	if (!TILE_DATA_CACHE[tileIndex])
		TILE_DATA_CACHE[tileIndex] = new TileLayerData(tileIndex);
	return TILE_DATA_CACHE[tileIndex];
};

const cloud = (color, corner1, corner2) => {
	const g = (x, y, index) => ({
		x,
		y,
		value: { color, tile: gas(color, index), animSpeed: 4, frames: 4 },
	});

	const corners = [
		g(corner1.x, corner1.y, 0),
		g(corner2.x, corner2.y, 8),
		g(corner1.x, corner2.y, 6),
		g(corner2.x, corner1.y, 2),
	];

	const width = corner2.x - corner1.x - 1;
	const height = corner1.y - corner2.y - 1;

	const top = Array.from({ length: width }, (_, i) =>
		g(corner1.x + 1 + i, corner1.y, 1),
	);
	const bottom = Array.from({ length: width }, (_, i) =>
		g(corner1.x + 1 + i, corner2.y, 7),
	);
	const left = Array.from({ length: height }, (_, i) =>
		g(corner1.x, corner2.y + 1 + i, 3),
	);
	const right = Array.from({ length: height }, (_, i) =>
		g(corner2.x, corner2.y + 1 + i, 5),
	);
	const center = Array.from({ length: height }, (_, y) =>
		Array.from({ length: width }, (_, x) =>
			g(corner1.x + 1 + x, corner2.y + 1 + y, 4),
		),
	).flat();

	return [...corners, ...top, ...left, ...right, ...bottom, ...center];
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

	return Array.from({ length }, (_, i) => {
		const isBand = (i === 0 || i === length - 1) && length > 1;
		const value = isBand ? bandValue : straightValue;
		return {
			x: direction === "horizontal" ? x + i : x,
			y: direction === "horizontal" ? y : y + i,
			value,
		};
	});
}

const CORNER_LOOKUP = {
	"h-right-down": PIPE_TILES.CORNER_BOTTOM_RIGHT,
	"h-right-up": PIPE_TILES.CORNER_TOP_RIGHT,
	"h-left-down": PIPE_TILES.CORNER_BOTTOM_LEFT,
	"h-left-up": PIPE_TILES.CORNER_TOP_LEFT,
	"v-down-right": PIPE_TILES.CORNER_TOP_LEFT,
	"v-down-left": PIPE_TILES.CORNER_TOP_RIGHT,
	"v-up-right": PIPE_TILES.CORNER_BOTTOM_LEFT,
	"v-up-left": PIPE_TILES.CORNER_BOTTOM_RIGHT,
};

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

	for (let i = 1; i < coordinates.length - 1; i++) {
		const prev = coordinates[i - 1];
		const curr = coordinates[i];
		const next = coordinates[i + 1];

		let cornerKey = null;

		if (prev.y === curr.y && curr.x === next.x) {
			const hDir = prev.x < curr.x ? "right" : "left";
			const vDir = next.y > curr.y ? "down" : "up";
			cornerKey = `h-${hDir}-${vDir}`;
		} else if (prev.x === curr.x && curr.y === next.y) {
			const vDir = prev.y < curr.y ? "down" : "up";
			const hDir = next.x > curr.x ? "right" : "left";
			cornerKey = `v-${vDir}-${hDir}`;
		}

		if (cornerKey) {
			pipeline.push({ x: curr.x, y: curr.y, value: CORNER_LOOKUP[cornerKey] });
		}
	}

	return pipeline.flat();
}
