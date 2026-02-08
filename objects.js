class GameObject extends EngineObject {
	update() {
		this.renderOrder = -this.pos.y; // sort by y position
	}
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
		this.on = true;
	}
	toggle() {
		this.on = !this.on;
		this.tileInfo = tile(vec2(9, 10), vec2(16)).frame(this.on ? 1 : 0);
	}
}

class Mask extends GameObject {
	constructor(...args) {
		super(...args);
	}
	update() {
		super.update();
		let step = ((time * 6) % 8) | 0;
		this.tileInfo = tile(vec2(0, step < 4 ? 0 : step - 4), vec2(8, 10), 2);
	}
}

class Player extends GameObject {
	constructor(...args) {
		super(...args);
		this.lastEmitTime = 0;
		this.emitInterval = 0.1;
		this.inGas = false;
	}

	update() {
		super.update();

		const gasDataAtPos = gl.getData(this.pos.floor().add(vec2(16)));
		this.inGas = gasDataAtPos.tile;
		if (lever.on && this.inGas && this.maskName != "red") this.pos = vec2(0);

		const moveInput = keyDirection().clampLength(1);
		this.velocity = this.velocity.add(moveInput.scale(0.05));
		this.mirror = this.velocity.x < 0;
		this.setCollision();

		// TODO clamp
		cameraPos = this.pos.add(vec2(0, 2)).add(this.velocity.multiply(vec2(-1)));

		if (moveInput.length() === 0) {
			this.state = this.idle;
		} else {
			this.state = this.walk;
		}
		this.state();
	}

	setAnimation(state) {
		const animations = {
			idle: { rowOffset: 0, frames: 2, speed: 4 },
			walk: { rowOffset: 1, frames: 4, speed: 6 },
		};

		const anim = animations[state];
		this.tileInfo = tile(
			vec2(0, MASKS.indexOf(this.maskName) * 2 + anim.rowOffset),
			vec2(19, 21),
			1,
		).frame(((time * anim.speed) % anim.frames) | 0);
	}

	idle() {
		this.setAnimation("idle");
	}

	walk() {
		this.setAnimation("walk");
	}

	render() {
		let offset = player.pos
			.subtract(cameraPos)
			.multiply(vec2(0.15))
			.add(vec2(0, 0.5));
		drawTile(
			this.pos.add(offset),
			vec2(1),
			tile(vec2(), vec2(19, 21), 1).frame(2),
		);
		super.render();
	}
}
