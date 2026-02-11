// Player state and reactive management
const playerState = signal({ maskName: "none", position: vec2(0, 0), inGas: false, health: 100 });

const updatePlayerState = (updates) => playerState.value = { ...playerState.value, ...updates };

// State update functions
const updatePlayerPosition = (newPosition) => updatePlayerState({ position: newPosition });
const updatePlayerMask = (maskName) => updatePlayerState({ maskName: maskName });
const setPlayerInGas = (inGas) => updatePlayerState({ inGas: inGas });
const damagePlayer = (amount = 1) => updatePlayerState({ health: Math.max(0, playerState.value.health - amount) });

// Getter functions
const canSurviveGas = () => playerState.value.maskName === "red";
const isPlayerAlive = () => playerState.value.health > 0;
const isPlayerInDanger = () => playerState.value.inGas && !canSurviveGas();

// Initialize player state
const initializePlayerState = () => {
  playerState.value = { maskName: "none", position: vec2(0, 0), inGas: false, health: 100 };
  playerState.effect(() => console.log('Player state updated:', playerState.value));
};

class Player extends GameObject {
	constructor(...args) {
		super(...args);
		this.lastEmitTime = 0;
		this.emitInterval = 0.1;
		this.setCollision();
	}

	update() {
		super.update();
		updatePlayerPosition(this.pos);
		setPlayerInGas(gl.getData(this.pos.floor().add(vec2(16))).tile);
		
		if (lever.on && playerState.value.inGas && !canSurviveGas()) this.pos = vec2(0);
		
		const moveInput = keyDirection().clampLength(1);
		this.velocity = this.velocity.add(moveInput.scale(0.05));
		this.mirror = this.velocity.x < 0;
		cameraPos = this.pos.add(vec2(0, 2)).add(this.velocity.multiply(vec2(-1)));
		
		this.state = moveInput.length() > 0 ? this.walk : this.idle;
		this.state();
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
