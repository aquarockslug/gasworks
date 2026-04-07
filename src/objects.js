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
	constructor(pos, name, on = true) {
		var color = ["none", "red", "blue", "green", "yellow"].indexOf(name);
		super(pos, vec2(0.5), tile(vec2(9, 10), vec2(16)).frame(on ? color : 0), 0);
		this.on = on;
		this.name = name;
		this.color = color;
	}
	toggle() {
		this.on = !this.on;
		this.tileInfo = tile(vec2(9, 10), vec2(16)).frame(this.on ? this.color : 0);
		sfx.lever.play(this.pos, 0.66);
	}
}

class Exit extends GameObject {
	constructor(pos) {
		super(pos, vec2(0.5), tile(vec2(8, 10), vec2(16), 0));
	}
}

class Mask extends GameObject {
	constructor(pos, name) {
		super(pos, vec2(0.5), tile(vec2(10, 10), vec2(16), 0));
		this.name = name;
		this.color = ["none", "red", "blue", "green", "yellow"].indexOf(name);
	}
	update() {
		super.update();
		let step = ((time * 6) % 8) | 0;
		this.tileInfo = tile(
			vec2(this.color - 1, step < 4 ? 0 : step - 4),
			vec2(8, 10),
			2,
		);
	}
}

class Player extends GameObject {
	constructor(...args) {
		super(...args);
		this.drawSize = vec2(1);
		this.maskColor = MASKS[0];
		this.inGas = "none";
		this.health = 100;
		this.setCollision();
	}

	update() {
		super.update();
		this.updateGas();

		const moveInput = keyDirection().clampLength(1);
		this.velocity = this.velocity.add(moveInput.scale(0.05));
		this.mirror = this.velocity.x < 0;
		cameraPos = this.pos.add(vec2(0, 2)).add(this.velocity.multiply(vec2(-1)));

		this.state = moveInput.length() > 0 ? this.walk : this.idle;
		this.state();

		for (const lever of level.levers) {
			if (keyWasPressed("Space") && this.pos.distance(lever.pos) < 1)
				lever.toggle();
		}

		if (keyWasPressed("Space")) {
			const maskIndex = level.masks.findIndex(
				(m) => this.pos.distance(m.pos) < 1,
			);
			if (maskIndex !== -1) {
				const mask = level.masks[maskIndex];
				if (this.maskColor !== "none" && this.maskColor !== mask.name) {
					level.masks.push(new Mask(this.pos.copy(), this.maskColor));
				}
				mask.destroy();
				level.masks.splice(maskIndex, 1);
				this.maskColor = this.maskColor === mask.name ? "none" : mask.name;
			}
		}
	}

	die() {
		this.pos = level.start.copy();
		this.health = 100;
		this.maskColor = "none";

		// reset masks
		level.masks.map((m) => m.destroy());
		level.masks = level.masksData.map((d) => new Mask(d.pos, d.value));
	}

	updateGas() {
		const currentTilePos = this.pos.floor().add(vec2(16));
		let t = null;
		let gasColor = "none";
		for (const color of ["red", "blue", "green", "yellow"]) {
			const gasTile = gls[color].getData(currentTilePos).tile;
			if (gasTile) {
				gasColor = color;
				break;
			}
		}

		const newInGas = gasColor || "none";
		if (this.inGas !== newInGas) this.inGas = newInGas;

		// take damage
		const leverOn = this.currentLever()?.on ?? false;
		const wrongMask = this.inGas !== this.maskColor;
		const shouldTakeDamage = wrongMask && leverOn;
		const newHealth = clamp(this.health + (shouldTakeDamage ? -2 : 4), 0, 100);
		if (newHealth !== this.health) {
			this.health = newHealth;
			if (newHealth === 0) this.die();
		}
	}

	currentLever() {
		return level.levers.find((l) => l.name === this.inGas);
	}

	setAnimation(animState) {
		const animations = {
			idle: { rowOffset: 0, frames: 2, speed: 4 },
			walk: { rowOffset: 1, frames: 4, speed: 6 },
		};
		const anim = animations[animState];
		this.tileInfo = tile(
			vec2(0, MASKS.indexOf(this.maskColor) * 2 + anim.rowOffset),
			vec2(19, 21),
			1,
		).frame(((time * anim.speed) % anim.frames) | 0);
	}

	idle = () => this.setAnimation("idle");
	walk = () => {
		if ((time * 6) % 2 === 0) sfx.walk.play(this.pos, 0.2);
		this.setAnimation("walk");
	};

	render() {
		const offset = this.pos
			.subtract(cameraPos)
			.multiply(vec2(0.05))
			.add(vec2(0, 0.25));
		if (this.pos.y > -14.8 && !this.currentLever()?.on)
			drawTile(
				this.pos.add(offset),
				vec2(1),
				tile(vec2(), vec2(19, 21), 1).frame(2),
			);
		super.render();
	}
}
