maskData = (name) => ({
	y: MASKS.indexOf(name) * 2,
});

function emptyPipeData() {
	return Array(32)
		.fill(null)
		.map(() => Array(32).fill(null));
}

function addPipe(pipeData, x, y, pipe) {
	if (x < 0 || x >= 32 || y < 0 || y >= 32) {
		console.warn(
			`Invalid pipe position: (${x}, ${y}). Must be within 0-31 range.`,
		);
		return pipeData;
	}

	pipeData[y][x] = pipe;
	return pipeData;
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

function pipeLayer(pipeData = null) {
	const pos = vec2(-16);
	const pipeLayer = new TileCollisionLayer(pos, vec2(32));
	pipeLayer.renderOrder = -10000;

	pipeArray = pipeData || emptyPipeData();

	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const pipeValue = pipeArray[y][x];
			if (pipeValue) {
				const data = new TileLayerData(pipeValue);
				pipeLayer.setData(vec2(x, y), data);
				pipeLayer.setCollisionData(vec2(x, y));
			}
		}
	}

	pipeLayer.redraw();
	return pipeLayer;
}

function emptyGasData() {
	return Array(32)
		.fill(null)
		.map(() => Array(32).fill(null));
}

function addGas(gasData, x, y, gas) {
	if (x < 0 || x >= 32 || y < 0 || y >= 32) {
		console.warn(
			`Invalid gas position: (${x}, ${y}). Must be within 0-31 range.`,
		);
		return gasData;
	}

	gasData[y][x] = gas;
	return gasData;
}

function gasLayer(gasData = null) {
	const pos = vec2(-16);
	const gasLayer = new TileLayer(pos, vec2(32));
	gasLayer.renderOrder = -9999;

	gasArray = gasData || emptyGasData();

	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const gasValue = gasArray[y][x];
			if (gasValue) {
				const data = new TileLayerData(gasValue);
				gasLayer.setData(vec2(x, y), data);
			}
		}
	}

	gasLayer.redraw();
	return gasLayer;
}

function groundLayer() {
	const pos = vec2(-16);
	groundLayer = new TileCollisionLayer(pos, vec2(32));
	groundLayer.renderOrder = -100000;

	for (let y = 0; y <= 32; y++) {
		for (let x = 0; x < 32; x++) {
			let t =
				rand() < 0.95
					? [ground(0), ground(1), ground(3), ground(4)][randInt(0, 3)]
					: ground(2);

			if (y === 30) {
				t = wall(9);
				pl.setCollisionData(vec2(x, y));
			}
			if (y === 31) {
				t = wall(3);
				pl.setCollisionData(vec2(x, y));
			}
			const data = new TileLayerData(t);

			groundLayer.setData(vec2(x, y), data);
		}
	}

	groundLayer.redraw();
	return groundLayer;
}

function gameInit() {
	objectDefaultDamping = 0.7;
	player = new Player(vec2(), vec2(0.5), tile(vec2(), vec2(19, 21), 1));
	player.maskName = MASKS[0];
	player.drawSize = vec2(1);

	lever = new Lever(vec2(-2.5, 0), vec2(0.5), tile(vec2(10, 10), vec2(16), 0));
	mask = new Mask(vec2(5, -5), vec2(0.5), tile(vec2(0, 0), vec2(8), 2));

	pipeData = level.pipes.reduce(
		(acc, pipe) => addPipe(acc, pipe.x, pipe.y, pipe.value),
		emptyPipeData(),
	);

	gasData = level.gases.reduce(
		(acc, gas) => addGas(acc, gas.x, gas.y, gas.value),
		emptyGasData(),
	);

	pl = pipeLayer(pipeData);
	gl = gasLayer(gasData);
	grl = groundLayer();

	setCanvasFixedSize(vec2(512, 512));
	// squareGasCloud = emitGas(vec2(6), gases.square);
	// circleGasCloud = emitGas(vec2(-6), gases.triangle);
}

function gameUpdate() {
	if (keyWasPressed("Space") && player.pos.distance(lever.pos) < 1)
		lever.toggle()

	gl.pos = vec2(-16).add(vec2(lever.on ? 0 : 1000))

	if (keyWasPressed("Space") && player.pos.distance(mask.pos) < 1) {
		player.maskName = player.maskName === "red" ? "none" : "red"
	}
}

function gameRender() {
	// drawRect(vec2(), vec2(32), new Color().setHex("#bbc3ca"));
}

function postGameRender() {}

class GameObject extends EngineObject {
	render() {
		const drawSize = this.drawSize || this.size;
		const offset = this.getUp(drawSize.y / 4);
		const pos = this.pos.add(offset);
		drawTile(pos, drawSize, this.tileInfo, undefined, undefined, this.mirror);
	}
}

class Lever extends GameObject {
	constructor(...args) {
		super(...args);
		this.renderOrder = -500
		this.on = true
	}
	toggle() {
		this.on = !this.on
		this.tileInfo = tile(vec2(9, 10), vec2(16)).frame(this.on ? 1 : 0)
	}
}

class Mask extends GameObject {
	constructor(...args) {
		super(...args);
		this.renderOrder = -500
		this.collideWithTile = true
	}
	update() {
		this.tileInfo = vec2(0)
	}
}

class Player extends GameObject {
	constructor(...args) {
		super(...args);
		this.lastEmitTime = 0;
		this.emitInterval = 0.1;
		this.inGas = false
	}

	update() {
		super.update();

		this.inGas = gl.getData(this.pos.floor().add(vec2(16))).tile
		if (lever.on && this.inGas && this.maskName != "red") this.pos = vec2(0)

		const moveInput = keyDirection().clampLength(1).scale(0.075);
		this.velocity = this.velocity.add(moveInput);
		this.mirror = this.velocity.x < 0;
		this.setCollision();

		// TODO clamp
		cameraPos = this.pos.add(vec2(0, 2));

		if (moveInput.length() === 0) {
			this.state = this.idle;
		} else {
			this.state = this.walk;
			this.emitDustParticles();
		}
		this.state();
	}

	emitDustParticles() {
		if (time - this.lastEmitTime > this.emitInterval) {
			const feetPos = this.pos.add(vec2(0, 0.4));
			emitGas(feetPos, gases.dust);
			this.lastEmitTime = time;
		}
	}

	idle() {
		this.tileInfo = tile(vec2(0, maskData(this.maskName).y), vec2(19, 21), 1).frame(
			((time * 4) % 2) | 0,
		);
	}

	walk() {
		this.tileInfo = tile(
			vec2(0, maskData(this.maskName).y + 1),
			vec2(19, 21),
			1,
		).frame(((time * 6) % 4) | 0);
	}
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"pipes.png",
	"gorm.png",
	"masks.png",
]);
