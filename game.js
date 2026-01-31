const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

gases = {
	square: {
		emitterData: [
			vec2(0, 0),
			0, // pos, angle
			6,
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
			6,
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

function gameInit() {
	objectDefaultDamping = 0.7;
	const player = new Player(vec2(), vec2(0.5), tile(vec2(), vec2(19, 21), 1));
	player.drawSize = vec2(1);

	setCanvasFixedSize(vec2(512, 512));
	squareGasCloud = emitGas(vec2(6), gases.square);
	circleGasCloud = emitGas(vec2(-6), gases.triangle);

	const gameTile = (i, size = 16) => tile(i, size);
	spriteAtlas = {
		player: gameTile(0),
		circle: gameTile(0),
		crate: gameTile(1),
		icon: gameTile(2),
		circleBig: gameTile(2, 128),
		iconBig: gameTile(3, 128),
	};
	canvasClearColor = GRAY;

	// create tile layer
	const pos = vec2(-16);
	const tileLayer = new TileCollisionLayer(pos, vec2(32));
	tileLayer.renderOrder = -10000;
	for (pos.x = tileLayer.size.x; pos.x--; )
		for (pos.y = tileLayer.size.y; pos.y--; ) {
			if (randBool(0.7)) continue;

			const direction = randInt(4);
			const mirror = randBool();
			const data = new TileLayerData(randInt(6, 8));
			tileLayer.setData(pos, data);
			tileLayer.setCollisionData(pos);
		}
	tileLayer.redraw();
}

function gameUpdate() {}

function gameRender() {
	drawRect(vec2(), vec2(32), new Color().setHex("#bbc3ca"));

	// draw more sprites from the atlas
	// drawTile(vec2(-7, 4), vec2(5), spriteAtlas.crate);
	// drawTile(vec2(0, 4), vec2(5), spriteAtlas.circle);
	// drawTile(vec2(7, 4), vec2(5), spriteAtlas.circleBig);
}

function postGameRender() {}

class GameObject extends EngineObject {
	render() {
		// adjust draw position to be at the bottom of the object
		const drawSize = this.drawSize || this.size;
		const offset = this.getUp(drawSize.y / 4);
		const pos = this.pos.add(offset);
		drawTile(
			pos,
			drawSize,
			this.tileInfo,
			undefined,
			undefined,
			this.angle,
			undefined,
			100,
		);
	}
}

class Player extends GameObject {
	update() {
		super.update();

		// apply movement controls
		const moveInput = keyDirection().clampLength(1).scale(0.1);
		this.velocity = this.velocity.add(moveInput);
		this.setCollision();

		// move camera with player
		cameraPos = this.pos.add(vec2(0, 2));
	}
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, ["pipes.png", "gorm.png"])
