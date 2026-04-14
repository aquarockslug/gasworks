let player, level, pl, gls, grl;
let debugMode = false;

function loadLevel(levelName) {
	if (level) {
		level.exit?.destroy();
		level.levers?.forEach((l) => l.destroy());
		level.masks?.forEach((m) => m.destroy());
		player?.destroy();
		for (const color of MASKS.slice(1)) {
			gls[color]?.destroy();
		}
		pl?.destroy();
	}

	const loadedLevel = levels.find((l) => l.name === levelName);
	if (!loadedLevel) throw new Error(`Level "${levelName}" not found`);
	level = { ...loadedLevel };

	player = new Player(
		level.startPos,
		vec2(0.5, 0.25),
		tile(vec2(), vec2(19, 21), 1),
	);

	level.exit = new Exit(level.exitPos);
	level.levers = level.leversData.map((d) => new Lever(d.pos, d.value));
	level.masks = level.masksData.map((d) => new Mask(d.pos, d.value));

	gasLayers = MASKS.slice(1);
	for (const color of gasLayers) {
		const data = level.gases
			.filter((g) => g.value.color === color)
			.reduce(
				(grid, gas) =>
					addToGrid(grid, gas.x + 16, gas.y + 16, gas.value, "gas"),
				createEmptyGrid(),
			);
		gasLayers[color] = createTileLayer(data, false, -9999);
	}

	pl = createTileLayer(
		level.pipes.reduce(
			(acc, pipe) =>
				addToGrid(acc, pipe.x + 16, pipe.y + 16, pipe.value, "pipe"),
			createEmptyGrid(),
		),
		true,
		-10000,
	);

	gls = gasLayers;
	grl = groundLayer();

	return level;
}

function gameInit() {
	objectDefaultDamping = 0.7;
	setCanvasFixedSize(vec2(512, 512));
	canvasClearColor = rgb().setHex("#a9b0ba");
	touchGamepadEnable = true;
	touchGamepadAnalog = false;
	touchGamepadButtonCount = 1;

	if (window.mobileStart) {
		startGame(0);
	}
}

function gameUpdate() {
	if (!level || !level.levers) return;
	if (keyWasPressed("F1")) debugMode = !debugMode;

	pipeTileAnimation();
	gasTileAnimation();

	MASKS.slice(1).forEach((color) => {
		if (!level.levers) return;
		const lever = level.levers.find((l) => l.name === color);
		const isOn = lever?.on ?? false;
		gls[color].pos = vec2(-16).add(isOn ? vec2(0) : vec2(1000));
		gls[color].redraw();
	});
}

const pipeTileAnimation = () => {
	if (!level || !pl) return;
	const pipeGrid = level.pipes.reduce(
		(acc, pipe) => addToGrid(acc, pipe.x + 16, pipe.y + 16, pipe.value, "pipe"),
		createEmptyGrid(),
	);

	const tiles = Array.from({ length: 32 }, (_, y) =>
		Array.from({ length: 32 }, (_, x) => [x, y]),
	).flat();

	const brokenPipes = tiles
		.map(([x, y]) => ({
			pos: vec2(x, y),
			p: PIPE_BROKEN_LOOKUP[pipeGrid[y]?.[x]],
		}))
		.filter(({ p }) => p);

	for (const { pos, p } of brokenPipes) {
		const lever = level.levers.find((l) => l.name === p.color);
		const color = lever?.on ? p.color : "none";
		const frame = color === "none" || (time | 0) % 2 === 0 ? 0 : 36;
		pl.setData(pos, getTileData(pipe("broken", p.dir, color) + frame));
	}

	pl.redraw();
};

const gasTileAnimation = () => {
	if (!level || !gls) return;
	const frame = ((time * 6) | 0) % 4;
	const gasFrame = frame === 3 ? 1 : frame;

	MASKS.slice(1).forEach((color) => {
		const layer = gls[color];
		const gasData = level.gases
			.filter((g) => g.value.color === color)
			.map((g) => ({
				pos: vec2(g.x + 16, g.y + 16),
				gas: g.value,
			}));

		gasData.forEach(({ pos, gas }) => {
			const tileIndex = typeof gas === "object" ? gas.tile : gas;
			layer.setData(pos, getTileData(tileIndex + gasFrame * 3));
		});
	});
};

function gameRender() {}

function postGameRender() {
	if (!player) return;
	const deathFade = 1 - player.health / 100;
	if (deathFade > 0)
		drawRect(vec2(), vec2(100), new Color(0, 0, 0, deathFade * 0.5));

	if (!debugMode) return;
	const currentTilePos = player.pos.floor().add(vec2(16));
	for (const color of MASKS.slice(1)) {
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
