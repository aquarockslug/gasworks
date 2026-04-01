const sfx = {
	walk: new Sound([
		2,
		,
		459,
		0.01,
		0.01,
		0.002,
		3,
		2,
		,
		,
		,
		,
		,
		,
		15,
		0.1,
		0.22,
		0.83,
		0.01,
	]),
	lever: new Sound([
		,
		,
		191,
		0.02,
		0.01,
		0.07,
		3,
		3.5,
		,
		,
		,
		,
		0.5,
		,
		0.4,
		,
		0.86,
		0.01,
	]),
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
		x: x,
		y: y,
		value: { color, tile: gas(color, index), animSpeed: 4, frames: 4 },
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
