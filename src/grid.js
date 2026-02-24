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

function groundLayer() {
	const pos = vec2(-16);
	const groundLayer = new TileCollisionLayer(pos, vec2(32));
	groundLayer.renderOrder = -100000;

	for (let y = 1; y < 31; y++) {
		for (let x = 0; x < 32; x++) {
			let t =
				x % 4 || y % 5 || rand() < 0.5
					? [ground(0), ground(1), ground(3), ground(4)][randInt(0, 3)]
					: ground(2);

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
		groundLayer.setCollisionData(vec2(x, 31));
		groundLayer.setData(
			vec2(x, 31),
			getTileData(wall(rand() < 0.2 ? (rand() < 0.5 ? 8 : 10) : 9)),
		);
		groundLayer.setCollisionData(vec2(x, 0));
		groundLayer.setData(vec2(x, 0), getTileData(wall(3)));
	}

	groundLayer.setData(vec2(31, 31), getTileData(wall(11)));
	groundLayer.setData(vec2(0, 31), getTileData(wall(7)));
	groundLayer.setData(vec2(31, 0), getTileData(wall(4)));
	groundLayer.setData(vec2(0, 0), getTileData(wall(2)));

	groundLayer.redraw();
	return groundLayer;
}
