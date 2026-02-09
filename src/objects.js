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
