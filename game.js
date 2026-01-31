const BUTTONCLICKSOUND = new Sound([
	0.08, 0, 250, 0.01, 0.01, 0.02, 1, 0.8, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.3,
	0.04, 0.05, 350,
]);

const SANDRED = new Color(0.78, 0.28, 0.03);
const SANDLIGHTBROWN = new Color(0.97, 0.88, 0.63);

function gameInit() {
	setCanvasFixedSize(vec2(720, 720));
}

function gameUpdate() {}

function gameRender() {
	drawRect(vec2(), vec2(32), SANDLIGHTBROWN);
}

function postGameRender() {}
