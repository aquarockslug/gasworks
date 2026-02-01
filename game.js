const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

MASKS = ["none", "red", "blue", "green", "yellow"]

mask = (name) => ({
		y: MASKS.indexOf(name) * 2
})


pipe = (broken, gas, index) => {
	working = [6, 7, 8, 6 + 18, 8 + 18, 6 + 36, 7 + 36, 8 + 36]
	pipes = {
		topLeftCorner: 6,
		banded: 8,
		horizontal: 8,
	}
	if (!broken && !gas) return working[randInt(0, working.length)]
}

ground = (index)


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

function gameInit() {
	objectDefaultDamping = 0.7;
	player = new Player(vec2(), vec2(0.5), tile(vec2(), vec2(19, 21), 1));
	player.maskName = MASKS[0]
	player.drawSize = vec2(1);

	setCanvasFixedSize(vec2(512, 512));
	squareGasCloud = emitGas(vec2(6), gases.square);
	circleGasCloud = emitGas(vec2(-6), gases.triangle);

	// create tile layer
	const pos = vec2(-16);
	const pipeLayer = new TileCollisionLayer(pos, vec2(32));
	pipeLayer.renderOrder = -10000;
	for (pos.x = pipeLayer.size.x; pos.x--; )
		for (pos.y = pipeLayer.size.y; pos.y--; ) {
			if (randBool(0.7)) continue;

			const data = new TileLayerData(pipe(false, false));
			pipeLayer.setData(pos, data);
			pipeLayer.setCollisionData(pos);
		}
	pipeLayer.redraw();
}

function gameUpdate() {
	if (keyWasPressed("Space"))
		player.maskName = MASKS[MASKS.indexOf(player.maskName) + 1]
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
		drawTile(
			pos,
			drawSize,
			this.tileInfo,
			undefined,
			undefined,
			this.mirror,
		);
	}
}

class Player extends GameObject {

	update() {
		super.update();

		const moveInput = keyDirection().clampLength(1).scale(0.075);
		this.velocity = this.velocity.add(moveInput);
		this.mirror = this.velocity.x < 0
		this.setCollision();

		cameraPos = this.pos.add(vec2(0, 2));

		if (moveInput.length() === 0){
			this.state = this.idle
		} else {
			this.state = this.walk
		}
		this.state()
	}

	idle() {
		this.tileInfo = tile(vec2(0, mask(this.maskName).y), vec2(19, 21), 1).frame(time*4%2|0);
	}

	walk() {
		this.tileInfo = tile(vec2(0, mask(this.maskName).y + 1), vec2(19, 21), 1).frame(time*8%4|0);
	}
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, ["pipes.png", "gorm.png"])
