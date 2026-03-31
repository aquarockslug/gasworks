let player, pipeData, gasData, pl, gl, grl, level;
let debugMode = false;

const updateGasDetection = () => {
	const currentTilePos = player.pos.floor().add(vec2(16));
	const t = gl.getData(currentTilePos).tile;

	const gasColor = t
		? Object.keys(level.gasTilesByColor).find((color) =>
				level.gasTilesByColor[color].includes(t),
			)
		: null;

	const newInGas = gasColor || "none";

	if (player.inGas !== newInGas) player.inGas = newInGas;
};

const updateGasDamage = () => {
	const currentLever = level.levers.find((l) => l.name === player.inGas);
	const shouldTakeDamage =
		player.inGas !== "none" &&
		player.inGas !== player.maskColor &&
		currentLever?.on;
	const newHealth = clamp(player.health + (shouldTakeDamage ? -2 : 4), 0, 100);
	if (newHealth !== player.health) {
		player.health = newHealth;
		if (newHealth === 0) {
			player.pos = level.startPos;
			player.health = 100;
		}
	}
};

function gameInit() {
	initTileDataCache();
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
	for (const color of MASKS.slice(1)) {
		const tiles = [8, 7, 6, 5, 4, 3, 2, 1, 0]
			.flatMap((i) => [0, 3, 6].map((o) => gas(color, i) + o))
			.filter((t) => !isNaN(t));
		if (tiles.length > 0) level.gasTilesByColor[color] = tiles;
	}

	pipeData = level.pipes.reduce(
		(acc, pipe) => addToGrid(acc, pipe.x + 16, pipe.y + 16, pipe.value, "pipe"),
		createEmptyGrid(),
	);

	gasData = level.gases.reduce(
		(acc, gas) => addToGrid(acc, gas.x + 16, gas.y + 16, gas.value, "gas"),
		createEmptyGrid(),
	);

	pl = createTileLayer(pipeData, true, -10000);
	gl = createTileLayer(gasData, false, -9999);
	grl = groundLayer();

	setCanvasFixedSize(vec2(512, 512));
	canvasClearColor = rgb().setHex("#a9b0ba");
}

function gameUpdate() {
	if (keyWasPressed("F1")) debugMode = !debugMode;

	updateGasDetection();
	updateGasDamage();

	gasTileAnimation();
	pipeTileAnimation();

	gl.redraw();
	pl.redraw();

	// TODO create a different layer for each color of gas
	gl.pos = vec2(-16).add(
		vec2(level.levers.find((l) => l.name === "red")?.on ? 0 : 1000),
	);
}

function gasTileAnimation() {
	const frame = ((time * 6) | 0) % 4;
	const gasFrame = frame === 3 ? 1 : frame;

	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const gas = gasData[y][x];
			if (!gas) continue;

			const tileIndex = typeof gas === "object" ? gas.tile : gas;
			const data = getTileData(tileIndex + gasFrame * 3);
			gl.setData(vec2(x, y), data);
		}
	}
}

function pipeTileAnimation() {
	const brokenDirections = ["up", "down", "right", "left"];
	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const pipeTile = pipeData[y][x];
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
	const intensity = 1 - player.health / 100;
	if (intensity > 0)
		drawRect(vec2(), vec2(100), new Color(0, 0, 0, intensity * 0.5));

	if (debugMode) {
		const currentTilePos = player.pos.floor().add(vec2(16));
		const tileData = gl.getData(currentTilePos);
		const tileNum = tileData?.tile ?? -1;
		drawTextScreen(`Tile: ${tileNum}`, vec2(80, 30), 20, new Color(0, 0, 0, 1));
		drawTextScreen(
			`Pos: ${player.pos.x.toFixed(1)}, ${player.pos.y.toFixed(1)}`,
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
		const lever = level.levers.find((l) => l.color === player.inGas);
		drawTextScreen(
			`Lever: ${lever?.on ?? "none"}`,
			vec2(80, 130),
			16,
			new Color(0, 0, 0, 1),
		);
	}
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"assets/pipes.png",
	"assets/gorm.png",
	"assets/masks.png",
]);
