// Global game variables
let player, lever, mask, gasAnimTime, pipeData, gasData, pl, gl, grl;

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
				if (isCollision) {
					layer.setCollisionData(vec2(x, y));
				}
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
				(x % 4 || y % 5) || rand() < 0.5
					? [ground(0), ground(1), ground(3), ground(4)][randInt(0, 3)]
					: ground(2);

			// Add left border wall at x=0
			if (x === 0) {
				t = wall(13);
				groundLayer.setCollisionData(vec2(x, y));
			}
			// Add right border wall at x=31
			else if (x === 31) {
				t = wall(14);
				groundLayer.setCollisionData(vec2(x, y));
			}

			groundLayer.setData(vec2(x, y), getTileData(t));
		}
	}

	// Add top and bottom border
	for (let x = 1; x < 31; x++) {
		groundLayer.setCollisionData(vec2(x, 31));
		groundLayer.setData(
			vec2(x, 31),
			getTileData(wall(rand() < 0.2 ? (rand() < 0.5 ? 8 : 10) : 9)),
		);
		groundLayer.setCollisionData(vec2(x, 0));
		groundLayer.setData(vec2(x, 0), getTileData(wall(3)));
	}

	groundLayer.setData(vec2(31, 31), getTileData(wall(11))); // upper right
	groundLayer.setData(vec2(0, 31), getTileData(wall(7)));// upper left
	groundLayer.setData(vec2(31, 0), getTileData(wall(4))); // lower right
	groundLayer.setData(vec2(0, 0), getTileData(wall(2))); // lower left

	groundLayer.redraw();
	return groundLayer;
}

function gameInit() {
	initTileDataCache();
	objectDefaultDamping = 0.7;
	player = new Player(vec2(), vec2(0.5, 0.25), tile(vec2(), vec2(19, 21), 1));
	player.drawSize = vec2(1);

	// Initialize reactive player state
	initializePlayerState();
	playerState.value = {
		...playerState.value,
		maskName: MASKS[0]
	};

	gasAnimTime = 0;

	lever = new Lever(vec2(-2.5, -5.5), vec2(0.5), tile(vec2(10, 10), vec2(16), 0));
	mask = new Mask(vec2(5, -5), vec2(0.5), tile(vec2(0, 0), vec2(8), 2));

	pipeData = level.pipes.reduce(
		(acc, pipe) => addToGrid(acc, pipe.x, pipe.y, pipe.value, "pipe"),
		createEmptyGrid(),
	);

	gasData = level.gases.reduce(
		(acc, gas) => addToGrid(acc, gas.x, gas.y, gas.value, "gas"),
		createEmptyGrid(),
	);

	pl = createTileLayer(pipeData, true, -10000);
	gl = createTileLayer(gasData, false, -9999);
	grl = groundLayer();

	setCanvasFixedSize(vec2(512, 512));
	canvasClearColor = rgb().setHex("#a9b0ba")
	// squareGasCloud = emitGas(vec2(6), gases.square);
	// circleGasCloud = emitGas(vec2(-6), gases.triangle);
}

function gameUpdate() {
	gasAnimTime += timeDelta;

	// Animate gas tiles
	const frame = ((gasAnimTime * 6) | 0) % 4; // 4-frame loop
	const actualFrame = frame === 3 ? 1 : frame; // Sequence: 0, 1, 2, 1 repeat

	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const gas = gasData[y][x];
			if (!gas) continue;

			const tileIndex = typeof gas === "object" ? gas.tile : gas;
			const data = getTileData(tileIndex + actualFrame * 3);
			gl.setData(vec2(x, y), data);
		}
	}

	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const pipeTile = pipeData[y][x];
			if (!pipeTile) continue;

			let tileIndex = typeof pipeTile === "object" ? pipeTile.tile : pipeTile;

			if (
				tileIndex == 25 ||
				tileIndex == 60
			)
				tileIndex = time % 2 > 1 ? 25 : 60;

			const data = getTileData(tileIndex);
			gl.setData(vec2(x, y), data);
		}
	}

	gl.redraw();
	pl.redraw();

	if (keyWasPressed("Space") && player.pos.distance(lever.pos) < 1)
		lever.toggle();

	gl.pos = vec2(-16).add(vec2(lever.on ? 0 : 1000));

	if (keyWasPressed("Space") && player.pos.distance(mask.pos) < 1) {
		const currentMask = playerState.value.maskName;
		updatePlayerMask(currentMask === "red" ? "none" : "red");
	}
}

function gameRender() {
	// drawRect(vec2(), vec2(32), new Color().setHex("#bbc3ca"));
}

function postGameRender() {}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"assets/pipes.png",
	"assets/gorm.png",
	"assets/masks.png",
]);
