let player, pl, gls, grl, level;
let debugMode = false;

function gameInit() {
	objectDefaultDamping = 0.7;

	level = levels[0];
	player = new Player(
		level.startPos,
		vec2(0.5, 0.25),
		tile(vec2(), vec2(19, 21), 1),
	);

	level.levers = (level.leversData || level.levers).map(
		(d) => new Lever(d.pos, d.value),
	);
	level.masks = (level.masksData || level.masks).map(
		(d) => new Mask(d.pos, d.value),
	);

	level.gasTilesByColor = {};
	const gasTypeCounts = { blue: 9, red: 9, green: 9, yellow: 9 };
	for (const color of ["red", "blue", "green", "yellow"]) {
		const count = gasTypeCounts[color];
		const tiles = Array.from({ length: count }, (_, i) => count - 1 - i)
			.flatMap((i) => [0, 3, 6].map((o) => gas(color, i) + o))
			.filter((t) => !isNaN(t));
		if (tiles.length > 0) level.gasTilesByColor[color] = tiles;
	}

	level.pipeData = level.pipes.reduce(
		(acc, pipe) => addToGrid(acc, pipe.x + 16, pipe.y + 16, pipe.value, "pipe"),
		createEmptyGrid(),
	);

	const colors = ["red", "blue", "green", "yellow"];
	const gasLayers = {};
	for (const color of colors) {
		const data = level.gases
			.filter((g) => g.value.color === color)
			.reduce(
				(grid, gas) =>
					addToGrid(grid, gas.x + 16, gas.y + 16, gas.value, "gas"),
				createEmptyGrid(),
			);
		gasLayers[color] = createTileLayer(data, false, -9999);
	}

	pl = createTileLayer(level.pipeData, true, -10000);
	gls = gasLayers;
	grl = groundLayer();

	setCanvasFixedSize(vec2(512, 512));
	canvasClearColor = rgb().setHex("#a9b0ba");
}

function gameUpdate() {
	if (keyWasPressed("F1")) debugMode = !debugMode;

	gasTileAnimation();
	pipeTileAnimation();

	for (const color of ["red", "blue", "green", "yellow"]) {
		const isOn = level.levers.find((l) => l.name === color)?.on ?? false;
		gls[color].pos = vec2(-16).add(isOn ? vec2(0) : vec2(1000));
		gls[color].redraw();
	}
}

function gasTileAnimation() {
	const frame = ((time * 6) | 0) % 4;
	const gasFrame = frame === 3 ? 1 : frame;

	for (const color of ["red", "blue", "green", "yellow"]) {
		const data = level.gases
			.filter((g) => g.value.color === color)
			.reduce(
				(grid, gas) =>
					addToGrid(grid, gas.x + 16, gas.y + 16, gas.value, "gas"),
				createEmptyGrid(),
			);
		const layer = gls[color];
		for (let y = 0; y < 32; y++) {
			for (let x = 0; x < 32; x++) {
				const gas = data[y][x];
				if (!gas) continue;

				const tileIndex = typeof gas === "object" ? gas.tile : gas;
				const tileData = getTileData(tileIndex + gasFrame * 3);
				layer.setData(vec2(x, y), tileData);
			}
		}
	}
}

function pipeTileAnimation() {
	const brokenDirections = ["up", "down", "right", "left"];
	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const pipeTile = level.pipeData[y][x];
			if (!pipeTile) continue;

			let tileIndex = typeof pipeTile === "object" ? pipeTile.tile : pipeTile;
			const brokenIndex = brokenDirections.findIndex(
				(dir) => tileIndex === pipe("broken", dir),
			);

			if (brokenIndex !== -1) {
				tileIndex =
					time % 2 > 1
						? pipe("broken", brokenDirections[brokenIndex])
						: pipe("broken", brokenDirections[brokenIndex]) + 36;
			}

			const data = getTileData(tileIndex);
			pl.setData(vec2(x, y), data);
		}
	}
}

function gameRender() {}

function postGameRender() {
	const deathFade = 1 - player.health / 100;
	if (deathFade > 0)
		drawRect(vec2(), vec2(100), new Color(0, 0, 0, deathFade * 0.5));

	if (!debugMode) return;
	const currentTilePos = player.pos.floor().add(vec2(16));
	for (const color of ["red", "blue", "green", "yellow"]) {
		const tileData = gls[color].getData(currentTilePos);
		if (tileData?.tile) {
			const tileNum = tileData.tile;
			drawTextScreen(
				`Tile: ${tileNum}`,
				vec2(80, 30),
				20,
				new Color(0, 0, 0, 1),
			);
			break;
		}
	}
	drawTextScreen(
		`Pos: ${Math.floor(player.pos.x)}, ${Math.floor(player.pos.y)}`,
		vec2(80, 55),
		16,
		new Color(0, 0, 0, 1),
	);
	drawTextScreen(
		`In Gas: ${player.inGas}`,
		vec2(80, 80),
		16,
		new Color(0, 0, 0, 1),
	);
	drawTextScreen(
		`Mask: ${player.maskColor}`,
		vec2(80, 105),
		16,
		new Color(0, 0, 0, 1),
	);
	const lever = level.levers.find((l) => l.name === player.inGas);
	drawTextScreen(
		`Lever: ${lever?.on ?? "none"}`,
		vec2(80, 130),
		16,
		new Color(0, 0, 0, 1),
	);
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"assets/tiles.png",
	"assets/gorm.png",
	"assets/masks.png",
]);
