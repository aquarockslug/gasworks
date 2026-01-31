const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

const SANDRED = new Color(0.78, 0.28, 0.03);
const SANDLIGHTBROWN = new Color(0.97, 0.88, 0.63);

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
		console.error('Invalid gas object provided');
		return null;
	}

	const emitterConfig = [...gas.emitterData];
	emitterConfig[0] = position;

	gas.emitter = new ParticleEmitter(...emitterConfig)
	return gas
}

function gameInit() {
    	// setup level
    	objectDefaultDamping = .7;
    	const player = new Player(vec2(), vec2(0.7), tile(0), 0, RED);
    	player.drawSize = vec2(1);

	setCanvasFixedSize(vec2(512, 512));
	squareGasCloud = emitGas(vec2(6), gases.square)
	circleGasCloud = emitGas(vec2(-6), gases.triangle)

    	// create tile layer
    	const pos = vec2(-16);
    	const tileLayer = new TileCollisionLayer(pos, vec2(32));
    	for (pos.x = tileLayer.size.x; pos.x--;)
    	for (pos.y = tileLayer.size.y; pos.y--;)
    	{
    	    	// check if tile should be solid
        	if (randBool(.7)) continue;

        	// set tile data
        	const tileIndex = 11;
        	const direction = randInt(4)
        	const mirror = randBool();
        	// const color = randColor(WHITE, hsl(0,0,.2));
        	const data = new TileLayerData(tileIndex, direction, mirror, GRAY);
        	tileLayer.setData(pos, data);
        	tileLayer.setCollisionData(pos);
    	}
    	tileLayer.redraw(); // redraw tile layer with new data
}

function gameUpdate() {}

function gameRender() {
	drawRect(vec2(), vec2(32), WHITE);
}

function postGameRender() {}

class GameObject extends EngineObject
{
    update()
    {
        this.renderOrder = -this.pos.y; // sort by y position
    }

    render()
    {
        // adjust draw position to be at the bottom of the object
        const drawSize = this.drawSize || this.size;
        const offset = this.getUp(drawSize.y/6);
        const pos = this.pos.add(offset);
        drawTile(pos, drawSize, this.tileInfo, this.color, this.angle);
    }
}

class Player extends GameObject
{
    update()
    {
        super.update();

        // apply movement controls
        const moveInput = keyDirection().clampLength(1).scale(.2);
        this.velocity = this.velocity.add(moveInput);
        this.setCollision(); // make object collide

        // move camera with player
        cameraPos = this.pos.add(vec2(0,2));
    }
}
