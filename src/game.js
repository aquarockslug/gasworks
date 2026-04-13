let player, pl, gls, grl, level;
let debugMode = false;

function gameInit() {
	objectDefaultDamping = 0.7;
	setCanvasFixedSize(vec2(512, 512));
	canvasClearColor = rgb().setHex("#a9b0ba");

	level = levels.find((level) => level.name === "level one");
	if (!level) throw new Error("No level was loaded");

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
}

function gameUpdate() {
	if (keyWasPressed("F1")) debugMode = !debugMode;

	pipeTileAnimation();
	gasTileAnimation();

	MASKS.slice(1).forEach((color) => {
		const lever = level.levers.find((l) => l.name === color);
		const isOn = lever?.on ?? false;
		gls[color].pos = vec2(-16).add(isOn ? vec2(0) : vec2(1000));
		gls[color].redraw();
	});
}

const pipeTileAnimation = () => {
	const frame = (time | 0) % 2 === 0 ? 36 : 0;
	const pipeGrid = level.pipes.reduce(
		(acc, pipe) => addToGrid(acc, pipe.x + 16, pipe.y + 16, pipe.value, "pipe"),
		createEmptyGrid(),
	);

	Array.from({ length: 32 }, (_, y) =>
		Array.from({ length: 32 }, (_, x) => [x, y]),
	)
		.flat()
		.map(([x, y]) => ({
			pos: vec2(x, y),
			p: PIPE_BROKEN_LOOKUP[pipeGrid[y]?.[x]],
		}))
		.filter(({ p }) => p)
		.forEach(({ pos, p }) => {
			// TODO find the level.levers lever with the same color as p.
			// if the lever is not on, set color to "none"
			pl.setData(pos, getTileData(pipe("broken", p.dir, p.color) + frame));
		});

	pl.redraw();
};

const gasTileAnimation = () => {
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
