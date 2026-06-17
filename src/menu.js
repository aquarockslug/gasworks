"use strict";

let gameState = "menu";

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

function makeButton(pos, size, text, baseColor, hoverColor, onClick) {
	const b = new UIButton(vec2(), size, text);
	b.color = baseColor;
	b.hoverColor = hoverColor;
	b.textColor = color.fg;
	b.textHeight = size.y * 0.5;
	b.onRender = function () {
		const c = uiSystem.screenToNative(mainCanvasSize.scale(0.5));
		this.pos = c.add(pos);
	};
	b.onClick = () => sfx.click.play() && onClick();
	return b;
}

function createMainMenu() {
	if (!uiSystem) new UISystemPlugin();
	uiSystem.defaultCornerRadius = 5;

	const bgTile = tile(vec2(), vec2(720, 720), 3);
	const bg = new UIObject(vec2(), vec2());
	bg.color = CLEAR_BLACK;
	bg.shadowColor = CLEAR_BLACK;
	bg.gradientColor = undefined;
	bg.lineWidth = 0;
	bg.canBeHover = false;
	bg.isMouseOverlapping = () => true;
	bg.onRender = () => {
		const c = uiSystem.screenToNative(mainCanvasSize.scale(0.5));
		uiSystem.drawTile(c, vec2(720, 720), bgTile);
	};

	let buttonIndex = 1;

	makeText(vec2(0, -100), vec2(400, 80), "GASWORKS", color.red, 128);
	makeText(
		vec2(0, -40),
		vec2(400, 40),
		"Explore the toxic fumes",
		color.red,
		48,
	);

	const playBtn = makeButton(
		vec2(0, 60),
		vec2(400, 60),
		"PLAY",
		CLEAR_BLACK,
		CLEAR_BLACK,
		() => {
			setTimeout(() => {
				uiSystem.destroyObjects();
				createLevelSelect();
			});
		},
	);
	playBtn.textColor = BLACK;
	playBtn.lineColor = BLACK;
	playBtn.onEnter = function () {
		this.textColor = BLACK;
		this.lineColor = BLACK;
	};
	playBtn.onLeave = function () {
		this.textColor = color.red;
		this.lineColor = color.red;
	};
	playBtn.navigationIndex = buttonIndex++;
	playBtn.navigationAutoSelect = buttonIndex === 2;
}

function returnToLevelSelect() {
	uiSystem?.destroyObjects();
	if (level) {
		level.exit?.destroy();
		for (const l of level.levers ?? []) l.destroy();
		for (const m of level.masks ?? []) m.destroy();
		player?.destroy();
		for (const color of MASKS.slice(1)) {
			gls[color]?.destroy();
		}
		pl?.destroy();
	}
	gameState = "menu";
	setTimeout(createLevelSelect);
}

function createLevelSelect() {
	if (!uiSystem) new UISystemPlugin();
	uiSystem.defaultCornerRadius = 5;

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

	makeText(vec2(0, -210), vec2(400, 60), "SELECT LEVEL", color.red, 64);

	const backBtn = makeButton(
		vec2(-200, 220),
		vec2(100, 40),
		"BACK",
		color.grey.scale(0.9),
		color.grey,
		() => {
			setTimeout(() => {
				uiSystem.destroyObjects();
				createMainMenu();
			});
		},
	);
	backBtn.textHeight = 24;

	const cols = 4;
	const buttonWidth = 110;
	const buttonHeight = 40;
	const gapX = 10;
	const gapY = 10;
	const gridWidth = cols * buttonWidth + (cols - 1) * gapX;
	const startX = -gridWidth / 2 + buttonWidth / 2;
	const startY = -140;

	levels.forEach((level, i) => {
		const col = i % cols;
		const row = Math.floor(i / cols);
		const x = startX + col * (buttonWidth + gapX);
		const y = startY + row * (buttonHeight + gapY);

		if (!level.unfinished) {
			const displayName =
				level.name.charAt(0).toUpperCase() + level.name.slice(1);
			const btn = makeButton(
				vec2(x, y),
				vec2(buttonWidth, buttonHeight),
				displayName,
				color.red.scale(0.9),
				color.red,
				() => {
					setTimeout(() => {
						uiSystem.destroyObjects();
						gameState = "playing";
						loadLevel(level.name);
					});
				},
			);
			btn.textHeight = 16;
		}
	});
}

function pauseGame() {
	gameState = "paused";
	uiSystem.destroyObjects();
	createPauseMenu();
}

function createPauseButton() {
	const btn = makeButton(
		vec2(-225, 225),
		vec2(55, 30),
		"MENU",
		new Color(0, 0, 0, 0.5),
		new Color(0, 0, 0, 0.8),
		pauseGame,
	);
	btn.textHeight = 14;
}

function createPauseMenu() {
	const bg = new UIObject(vec2(), vec2());
	bg.color = new Color(0, 0, 0, 0.7);
	bg.gradientColor = undefined;
	bg.lineWidth = 0;
	bg.shadowColor = new Color(0, 0, 0, 0);
	bg.canBeHover = false;
	bg.isMouseOverlapping = () => true;
	bg.onRender = function () {
		const c = uiSystem.screenToNative(mainCanvasSize.scale(0.5));
		uiSystem.drawRect(c, vec2(512, 512), this.color, 0, BLACK, 0);
	};

	makeText(vec2(0, -100), vec2(400, 80), "PAUSED", color.red, 80);

	const resumeBtn = makeButton(
		vec2(0, 0),
		vec2(300, 60),
		"RESUME",
		CLEAR_BLACK,
		CLEAR_BLACK,
		() => {
			setTimeout(() => {
				uiSystem.destroyObjects();
				createPauseButton();
				gameState = "playing";
			});
		},
	);
	resumeBtn.textColor = color.red;
	resumeBtn.lineColor = color.red;
	resumeBtn.onEnter = function () {
		this.textColor = BLACK;
		this.lineColor = BLACK;
	};
	resumeBtn.onLeave = function () {
		this.textColor = color.red;
		this.lineColor = color.red;
	};

	const quitBtn = makeButton(
		vec2(0, 80),
		vec2(300, 60),
		"QUIT",
		CLEAR_BLACK,
		CLEAR_BLACK,
		() => {
			setTimeout(() => {
				uiSystem.destroyObjects();
				returnToLevelSelect();
			});
		},
	);
	quitBtn.textColor = color.red;
	quitBtn.lineColor = color.red;
	quitBtn.onEnter = function () {
		this.textColor = BLACK;
		this.lineColor = BLACK;
	};
	quitBtn.onLeave = function () {
		this.textColor = color.red;
		this.lineColor = color.red;
	};
}
