'use strict';

let gameState = 'menu';

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
		uiSystem.drawRect(c, vec2(512, 512),
			new Color(0, 0, 0, 0.85), 0, BLACK, 0,
			new Color(0.08, 0.08, 0.15, 0.85));
	};

	function makeText(pos, size, text, textColor, textHeight) {
		const t = new UIText(vec2(), size, text, 'center');
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
	function makeButton(pos, size, text, color, hoverColor, onClick) {
		const b = new UIButton(vec2(), size, text);
		b.color = color;
		b.hoverColor = hoverColor;
		b.textColor = new Color(1, 1, 1);
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

	makeText(
		vec2(0, -100), vec2(400, 80), 'GAS WORKS',
		new Color(1, 0.85, 0.2), 64,
	);
	makeText(
		vec2(0, -40), vec2(400, 40), 'Survive the toxic fumes',
		new Color(0.7, 0.7, 0.7), 20,
	);
	makeButton(
		vec2(0, 60), vec2(200, 60), 'PLAY',
		new Color(0.2, 0.6, 0.3),
		new Color(0.3, 0.8, 0.4),
		() => {
			setTimeout(() => {
				uiSystem.destroyObjects();
				gameState = 'playing';
				loadLevel('level one');
			});
		},
	);
	makeButton(
		vec2(0, 140), vec2(200, 60), 'LEVEL TWO',
		new Color(0.3, 0.3, 0.5),
		new Color(0.4, 0.4, 0.6),
		() => {
			setTimeout(() => {
				uiSystem.destroyObjects();
				gameState = 'playing';
				loadLevel('level two');
			});
		},
	);
}
