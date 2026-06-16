"use strict";

let gameState = "menu";

function createMainMenu() {
	new UISystemPlugin();
	uiSystem.defaultCornerRadius = 10;

	const bg = new UIObject(vec2(), vec2());
	bg.color = CLEAR_BLACK;
	bg.gradientColor = undefined;
	bg.lineWidth = 0;
	bg.shadowColor = CLEAR_BLACK;
	bg.canBeHover = false;
	bg.isMouseOverlapping = () => true;
	bg.onRender = () => {
		const c = uiSystem.screenToNative(mainCanvasSize.scale(0.5));
		uiSystem.drawRect(c, vec2(512, 512), color.bg, 0, BLACK, 0);
	};

	function makeText(pos, size, text, textColor, textHeight) {
		const t = new UIText(vec2(), size, text, "center");
		t.textColor = textColor;
		t.textHeight = textHeight;
		t.canBeHover = false;
		t.onRender = function () {
			const c = uiSystem.screenToNative(mainCanvasSize.scale(0.5));
			this.pos = c.add(pos);
		};
		return t;
	}

	let buttonIndex = 1;
	function makeButton(pos, size, text, baseColor, hoverColor, onClick) {
		const b = new UIButton(vec2(), size, text);
		b.color = baseColor;
		b.hoverColor = hoverColor;
		b.textColor = color.fg;
		b.textHeight = size.y * 0.5;
		b.navigationIndex = buttonIndex++;
		b.navigationAutoSelect = buttonIndex === 2;
		b.onRender = function () {
			const c = uiSystem.screenToNative(mainCanvasSize.scale(0.5));
			this.pos = c.add(pos);
		};
		b.onClick = onClick;
		return b;
	}

	makeText(vec2(0, -100), vec2(400, 80), "GASWORKS", color.red, 128);
	makeText(
		vec2(0, -40),
		vec2(400, 40),
		"Survive the toxic fumes",
		color.red,
		48,
	);

	makeButton(
		vec2(0, 60),
		vec2(200, 60),
		"PLAY",
		color.green.scale(0.9),
		color.green,
		() => {
			setTimeout(() => {
				uiSystem.destroyObjects();
				gameState = "playing";
				loadLevel("level one");
			});
			// makeButton(vec2(10, 10), vec2(10, 10), "PAUSE", color.red, ()=>{uiSystem.showConfirmDialog()})
		},
	);
}
