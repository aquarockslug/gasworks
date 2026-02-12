// player state 
const playerState = signal({ maskName: "none", inGas: false, health: 100 });
const updatePlayerState = (updates) => playerState.value = { ...playerState.value, ...updates };

// setters
const updatePlayerMask = (maskName) => updatePlayerState({ maskName: maskName });
const setPlayerInGas = (inGas) => updatePlayerState({ inGas: inGas }); // TODO get the color of the gas from the tile index
const damagePlayer = (amount = 1) => {
	updatePlayerState({ health: clamp(playerState.value.health - amount, 0, 100) })
	if (playerState.value.health === 0) player.die()
};

// getters
const canSurviveGas = () => playerState.value.maskName === "red";

// initialize player state
const initializePlayerState = () => {
  playerState.value = { maskName: "none", inGas: false, health: 100 };
  playerState.effect(() => console.log('Player state updated:', playerState.value));
};

class Player extends GameObject {
	constructor(...args) {
		super(...args);
		this.lastEmitTime = 0;
		this.emitInterval = 0.1;
		this.lastTilePos = null;
		this.setCollision();
	}

	update() {
		super.update();
		
		const currentTilePos = this.pos.floor().add(vec2(16));
		if (!this.lastTilePos || !currentTilePos.distance(this.lastTilePos) < 1) {
			setPlayerInGas(gl.getData(currentTilePos).tile);
			this.lastTilePos = currentTilePos;
		}
		
		if (lever.on && playerState.value.inGas && !canSurviveGas()) damagePlayer(1);
		else damagePlayer(-1)
		
		const moveInput = keyDirection().clampLength(1);
		this.velocity = this.velocity.add(moveInput.scale(0.05));
		this.mirror = this.velocity.x < 0;
		cameraPos = this.pos.add(vec2(0, 2)).add(this.velocity.multiply(vec2(-1)));
		
		this.state = moveInput.length() > 0 ? this.walk : this.idle;
		this.state();
	}

	die() {
		this.pos = vec2(0)
		updatePlayerState({ health: 100 })
	}

	setAnimation(state) {
		const animations = { idle: { rowOffset: 0, frames: 2, speed: 4 }, walk: { rowOffset: 1, frames: 4, speed: 6 } };
		const anim = animations[state];
		this.tileInfo = tile(
			vec2(0, MASKS.indexOf(playerState.value.maskName) * 2 + anim.rowOffset),
			vec2(19, 21), 1
		).frame(((time * anim.speed) % anim.frames) | 0);
	}

	idle = () => this.setAnimation("idle");
	walk = () => this.setAnimation("walk");

	render() {
		const offset = this.pos.subtract(cameraPos).multiply(vec2(0.15)).add(vec2(0, 0.5));
		drawTile(this.pos.add(offset), vec2(1), tile(vec2(), vec2(19, 21), 1).frame(2));
		super.render();
	}
}
