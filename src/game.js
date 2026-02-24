let player, pipeData, gasData, pl, gl, grl;
let maskName, level, inGas, health, redLever, mask;
let lastPlayerTilePos = null;

const initializeState = (v) => {
	({ maskName, level, inGas, health, redLever, mask } = v);
};

const updateState = (updates) => {
	if (updates.maskName !== undefined) maskName = updates.maskName;
	if (updates.level !== undefined) level = updates.level;
	if (updates.inGas !== undefined) inGas = updates.inGas;
	if (updates.health !== undefined) health = updates.health;
};

const updateGasDetection = () => {
	const currentTilePos = player.pos.floor().add(vec2(16));
	const t = gl.getData(currentTilePos).tile;

	const gasTiles = [8, 7, 6, 5, 4, 3, 2, 1, 0].flatMap((i) =>
		[0, 3, 6].map((o) => gas("red", i) + o),
	);
	const newInGas = t && gasTiles.includes(t) ? "red" : "none";

	if (inGas !== newInGas) inGas = newInGas;
	lastPlayerTilePos = currentTilePos;
};

const updateGasDamage = () => {
	const takeDamage = inGas !== "none" && inGas !== maskName;
	const newHealth = clamp(health + (takeDamage ? -2 : 4), 0, 100);
	if (newHealth !== health) {
		health = newHealth;
		if (newHealth === 0) {
			player.pos = level.startPos;
			health = 100;
		}
	}
};

const updateLeverInteraction = () => {
	if (keyWasPressed("Space") && player.pos.distance(redLever.pos) < 1)
		redLever.toggle();
};

const updateMaskInteraction = () => {
	if (keyWasPressed("Space") && player.pos.distance(mask.pos) < 1) {
		maskName = maskName === "red" ? "none" : "red";
	}
};

function gameInit() {
	initTileDataCache();
	objectDefaultDamping = 0.7;
	player = new Player(
		vec2(0, -14),
		vec2(0.5, 0.25),
		tile(vec2(), vec2(19, 21), 1),
	);
	player.drawSize = vec2(1);

	initializeState({
		maskName: MASKS[0],
		level: levels[0],
		inGas: "none",
		health: 100,
		redLever: new Lever(
			vec2(13, -10),
			vec2(0.5),
			tile(vec2(10, 10), vec2(16), 0),
		),
		mask: new Mask(vec2(-9, -9), vec2(0.5), tile(vec2(0, 0), vec2(8), 2)),
	});

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
	canvasClearColor = rgb().setHex("#a9b0ba");
}

function gameUpdate() {
	updateGasDetection();
	updateGasDamage();
	updateLeverInteraction();
	updateMaskInteraction();

	gasTileAnimation();
	pipeTileAnimation();

	gl.redraw();
	pl.redraw();

	gl.pos = vec2(-16).add(vec2(redLever.on ? 0 : 1000));
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
	const intensity = 1 - health / 100;
	if (intensity > 0)
		drawRect(vec2(), vec2(100), new Color(0, 0, 0, intensity * 0.5));
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"assets/pipes.png",
	"assets/gorm.png",
	"assets/masks.png",
]);
