/* Option 1 (Recommended): Animate gas tiles by cycling tile frames

Your gasLayer is a TileLayer, so the correct way to animate it is to change the tile’s frame over time and redraw.

Key idea

Store a base tile index for gas

Every frame (or every N frames), update the tile’s frame()

Call gasLayer.redraw()

Why this works well

Cheap (no particles needed)

Deterministic

Matches grid-based gas

Minimal change example
1. Store animation info per gas tile

Instead of storing just a tile index, store an object:

addGas(gasData, x, y, {
    tile: gas,
    animSpeed: 4,
});

2. Animate in gameUpdate
let gasAnimTime = 0;

function gameUpdate() {
    gasAnimTime += timeDelta;

    const frame = ((gasAnimTime * 6) | 0) % 4; // 4-frame loop

    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            const gas = gasArray[y][x];
            if (!gas) continue;

            const data = new TileLayerData(
                gas.tile.frame(frame)
            );
            gl.setData(vec2(x, y), data);
        }
    }

    gl.redraw();
}


💡 This assumes your gas tiles are laid out as animation frames horizontally in the tileset.
	*/



function createEmptyGrid(width = 32, height = 32) {
	return Array(height)
		.fill(null)
		.map(() => Array(width).fill(null));
}

function addToGrid(gridData, x, y, value, gridName = "grid") {
	if (x < 0 || x >= gridData[0].length || y < 0 || y >= gridData.length) {
		console.warn(
			`Invalid ${gridName} position: (${x}, ${y}). Must be within bounds.`,
		);
		return gridData;
	}

	gridData[y][x] = value;
	return gridData;
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

function createTileLayer(data = null, isCollision = false, renderOrder = -10000, position = vec2(-16), size = vec2(32)) {
	const layerClass = isCollision ? TileCollisionLayer : TileLayer;
	const layer = new layerClass(position, size);
	layer.renderOrder = renderOrder;

	const dataArray = data || createEmptyGrid();

		for (let y = 0; y < size.y; y++) {
			for (let x = 0; x < size.x; x++) {
				const value = dataArray[y][x];
				if (value) {
					const tileIndex = typeof value === 'object' && value.tile ? value.tile : value;
					const tileData = new TileLayerData(tileIndex);
					layer.setData(vec2(x, y), tileData);
					if (isCollision) {
						layer.setCollisionData(vec2(x, y));
					}
				}
			}
		}

	layer.redraw();
	return layer;
}

function groundLayer() {
	const pos = vec2(-16);
	const groundLayer = new TileCollisionLayer(pos, vec2(32));
	groundLayer.renderOrder = -100000;

	for (let y = 0; y <= 32; y++) {
		for (let x = 0; x < 32; x++) {
			let t =
				rand() < 0.95
					? [ground(0), ground(1), ground(3), ground(4)][randInt(0, 3)]
					: ground(2);

			if (y === 30) {
				t = wall(9);
				groundLayer.setCollisionData(vec2(x, y));
			}
			if (y === 31) {
				t = wall(3);
				groundLayer.setCollisionData(vec2(x, y));
			}
			const data = new TileLayerData(t);

			groundLayer.setData(vec2(x, y), data);
		}
	}

	groundLayer.redraw();
	return groundLayer;
}

let gasAnimTime = 0;

function gameInit() {
	objectDefaultDamping = 0.7;
	player = new Player(vec2(), vec2(0.5), tile(vec2(), vec2(19, 21), 1));
	player.maskName = MASKS[0];
	player.drawSize = vec2(1);

	lever = new Lever(vec2(-2.5, 0), vec2(0.5), tile(vec2(10, 10), vec2(16), 0));
	mask = new Mask(vec2(5, -5), vec2(0.5), tile(vec2(0, 0), vec2(8), 2));

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

	// gasData[16][16] = 10
	// gl = createTileLayer(gasData, false, -9999);

	grl = groundLayer();

	setCanvasFixedSize(vec2(512, 512));
	// squareGasCloud = emitGas(vec2(6), gases.square);
	// circleGasCloud = emitGas(vec2(-6), gases.triangle);
}

function gameUpdate() {
	gasAnimTime += timeDelta;

	// Animate gas tiles
	const frame = ((gasAnimTime * 6) | 0) % 3; // 3-frame loop

	for (let y = 0; y < 32; y++) {
		for (let x = 0; x < 32; x++) {
			const gas = gasData[y][x];
			if (!gas) continue;

			const tileIndex = typeof gas === 'object' ? gas.tile : gas;
			const data = new TileLayerData(tileIndex + ( frame * 3 ));
			gl.setData(vec2(x, y), data);
		}
	}

	gl.redraw();

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
		let step = time*6%8|0;
		this.tileInfo = tile(vec2(0, step < 4 ? 0 : step - 4), vec2(8, 10), 2)
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

		const gasDataAtPos = gl.getData(this.pos.floor().add(vec2(16)));
		this.inGas = gasDataAtPos.tile;
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

	setAnimation(state) {
		const animations = {
			idle: { rowOffset: 0, frames: 2, speed: 4 },
			walk: { rowOffset: 1, frames: 4, speed: 6 }
		};

		const anim = animations[state];
		this.tileInfo = tile(
			vec2(0, MASKS.indexOf(this.maskName) * 2 + anim.rowOffset),
			vec2(19, 21),
			1,
		).frame(((time * anim.speed) % anim.frames) | 0);
	}

	idle() {
		this.setAnimation('idle');
	}

	walk() {
		this.setAnimation('walk');
	}
}

engineInit(gameInit, gameUpdate, null, gameRender, postGameRender, [
	"pipes.png",
	"gorm.png",
	"masks.png",
]);
