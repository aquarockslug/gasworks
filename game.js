const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

const MASKS = ["none", "red", "blue", "green", "yellow"];
let pipeArray = [];

mask = (name) => ({
	y: MASKS.indexOf(name) * 2,
});

pipe = (broken, gas, index) => {
	let w = 18;
	working = [6, 7, 8, 6 + w, 8 + w, 6 + w * 2, 7 + w * 2, 8 + w * 2];
	if (!broken && !gas) return working[index];
	if (broken && !gas) return 7 + w;
};

ground = (index) => [38, 39, 38 + 18, 39 + 18][index];

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

gases = {
	square: {
		emitterData: [
			vec2(0, 0),
			0, // pos, angle
			1,
			undefined,
			100,
			PI, // emitSize, emitTime, rate, cone
			0, // tileInfo
			rgb(0, 0, 1, 0.5),
			hsl(0, 0, 1, 0.5), // colorStartA, colorStartB
			hsl(1, 0, 0, 0),
			hsl(0, 0, 1, 0), // colorEndA, colorEndB
			1,
			1,
			5,
			0.2,
			0.01, // time, sizeStart, sizeEnd, speed, angleSpeed
			0.85,
			1,
			-1,
			PI,
			0.3, // damp, angleDamp, gravity, particleCone, fade
			0.5,
			0,
			0,
			1, // randomness, collide, additive, colorLinear
		],
		effects: (player) => ({}),
	},
	triangle: {
		emitterData: [
			vec2(0, 0),
			0, // pos, angle
			1,
			undefined,
			100,
			PI, // emitSize, emitTime, rate, cone
			0, // tileInfo
			rgb(1, 0, 0, 0.5),
			hsl(0, 0, 1, 0.5), // colorStartA, colorStartB
			hsl(1, 0, 0, 0),
			hsl(0, 0, 1, 0), // colorEndA, colorEndB
			1,
			1,
			5,
			0.2,
			0.01, // time, sizeStart, sizeEnd, speed, angleSpeed
			0.85,
			1,
			-1,
			PI,
			0.3, // damp, angleDamp, gravity, particleCone, fade
			0.5,
			0,
			0,
			1, // randomness, collide, additive, colorLinear
		],
		effects: (player) => ({}),
	},
};

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

function initPipeLayer(pipeData = null) {
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

// TODO allow saving a level with this format
level = {
	pipes: [
		{ x: 16, y: 14, value: pipe(false, false, 1) },
		{ x: 17, y: 14, value: pipe(false, false, 2) },
		{ x: 17, y: 13, value: pipe(false, false, 3) },
		{ x: 14, y: 15, value: pipe(false, false, 4) },
		{ x: 14, y: 14, value: pipe(false, false, 5) },
		{ x: 15, y: 14, value: pipe(false, false, 6) },
		// vertical 
		{ x: 17, y: 12, value: pipe(false, false, 4) },
		{ x: 17, y: 11, value: pipe(false, false, 4) },
		{ x: 17, y: 10, value: pipe(false, false, 4) },
		{ x: 17, y: 9, value: pipe(false, false, 4) },
		{ x: 17, y: 8, value: pipe(false, false, 4) },
		{ x: 17, y: 7, value: pipe(false, false, 4) },
		{ x: 17, y: 6, value: pipe(false, false, 4) },
		{ x: 17, y: 5, value: pipe(false, false, 4) },
		{ x: 17, y: 4, value: pipe(false, false, 4) },
	],
};

function gameInit() {
	objectDefaultDamping = 0.7;
	player = new Player(vec2(), vec2(0.5), tile(vec2(), vec2(19, 21), 1));
	player.maskName = MASKS[0];
	player.drawSize = vec2(1);

	pipeData = emptyPipeData();
	pipeData = level.pipes.reduce((acc, pipe) =>
		addPipe(acc, pipe.x, pipe.y, pipe.value), pipeData
	);

	pipeLayer = initPipeLayer(pipeData);

	setCanvasFixedSize(vec2(512, 512));
	squareGasCloud = emitGas(vec2(6), gases.square);
	circleGasCloud = emitGas(vec2(-6), gases.triangle);
}

function gameUpdate() {
	if (keyWasPressed("Space"))
		player.maskName = MASKS[MASKS.indexOf(player.maskName) + 1];
}

function gameRender() {
	drawRect(vec2(), vec2(32), new Color().setHex("#bbc3ca"));
}

function postGameRender() {}

class GameObject extends EngineObject {
	render() {
		// adjust draw position to be at the bottom of the object
		const drawSize = this.drawSize || this.size;
		const offset = this.getUp(drawSize.y / 4);
		const pos = this.pos.add(offset);
		drawTile(pos, drawSize, this.tileInfo, undefined, undefined, this.mirror);
	}
}

class Player extends GameObject {
	update() {
		super.update();

		const moveInput = keyDirection().clampLength(1).scale(0.075);
		this.velocity = this.velocity.add(moveInput);
		this.mirror = this.velocity.x < 0;
		this.setCollision();

		cameraPos = this.pos.add(vec2(0, 2));

		if (moveInput.length() === 0) {
			this.state = this.idle;
		} else {
			this.state = this.walk;
		}
		this.state();
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
		).frame(((time * 8) % 4) | 0);
	}
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"pipes.png",
	"gorm.png",
]);
