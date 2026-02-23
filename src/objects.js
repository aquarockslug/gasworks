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
		sfx.lever.play(this.pos, 0.66);
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
		this.setCollision();
	}

	update() {
		super.update();

		const moveInput = keyDirection().clampLength(1);
		this.velocity = this.velocity.add(moveInput.scale(0.05));
		this.mirror = this.velocity.x < 0;
		cameraPos = this.pos.add(vec2(0, 2)).add(this.velocity.multiply(vec2(-1)));

		this.state = moveInput.length() > 0 ? this.walk : this.idle;
		this.state();
	}

	setAnimation(animState) {
		const animations = {
			idle: { rowOffset: 0, frames: 2, speed: 4 },
			walk: { rowOffset: 1, frames: 4, speed: 6 },
		};
		const anim = animations[animState];
		this.tileInfo = tile(
			vec2(0, MASKS.indexOf(state.value.maskName) * 2 + anim.rowOffset),
			vec2(19, 21),
			1,
		).frame(((time * anim.speed) % anim.frames) | 0);
	}

	idle = () => this.setAnimation("idle");
	walk = () => {
		if ((time * 6) % 2 == 0) sfx.walk.play(this.pos, 0.2);

		this.setAnimation("walk");
	};

	render() {
		const offset = this.pos
			.subtract(cameraPos)
			.multiply(vec2(0.05))
			.add(vec2(0, 0.25));
		drawTile(
			this.pos.add(offset),
			vec2(1),
			tile(vec2(), vec2(19, 21), 1).frame(2),
		);
		super.render();
	}
}
