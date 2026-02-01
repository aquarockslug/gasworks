mask = (name) => ({
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
				pipeLayer.setCollisionData(vec2(x, y));
			}
			if (y === 31) {
				t = wall(3);
				pipeLayer.setCollisionData(vec2(x, y));
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

	pipeData = level.pipes.reduce(
		(acc, pipe) => addPipe(acc, pipe.x, pipe.y, pipe.value),
		emptyPipeData(),
	);

	pipeLayer = pipeLayer(pipeData);
	groundLayer = groundLayer();

	setCanvasFixedSize(vec2(512, 512));
	// squareGasCloud = emitGas(vec2(6), gases.square);
	// circleGasCloud = emitGas(vec2(-6), gases.triangle);
}

function gameUpdate() {
	if (keyWasPressed("Space"))
		player.maskName = MASKS[MASKS.indexOf(player.maskName) + 1];
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

class Player extends GameObject {
	constructor(...args) {
		super(...args);
		this.lastEmitTime = 0;
		this.emitInterval = 0.1;
	}

	update() {
		super.update();

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
		this.tileInfo = tile(vec2(0, mask(this.maskName).y), vec2(19, 21), 1).frame(
			((time * 4) % 2) | 0,
		);
	}

	walk() {
		this.tileInfo = tile(
			vec2(0, mask(this.maskName).y + 1),
			vec2(19, 21),
			1,
		).frame(((time * 6) % 4) | 0);
	}
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"pipes.png",
	"gorm.png",
]);
