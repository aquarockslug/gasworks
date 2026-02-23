// Global game variables
let player, mask, gasAnimTime, pipeData, gasData, pl, gl, grl;
const state = signal({});

// player state
const initializeState = (v) => {
	state.value = v;
};
const updateState = (updates) => {
	state.value = { ...state.value, ...updates };
};

// effects are called when the state is changed
state.effect(() => {
	if (state.value.health === 0) {
		player.pos = vec2(0, -14);
		updateState({ health: 100 });
	}
});

const updatePlayerMask = (maskName) => updateState({ maskName: maskName });

let lastPlayerTilePos = null;

const updateGasDetection = () => {
	const currentTilePos = player.pos.floor().add(vec2(16));
	if (!lastPlayerTilePos || currentTilePos.distance(lastPlayerTilePos) >= 0.5) {
		const t = gl.getData(currentTilePos).tile;

		const gasTiles = [8, 7, 6, 5, 4, 3, 2, 1, 0].flatMap((i) =>
			[0, 3, 6].map((o) => gas("red", i) + o),
		);
		const inGas = t && gasTiles.includes(t) ? "red" : "none";
		// TODO check redLever

		if (state.value.inGas !== inGas) updateState({ inGas });
		lastPlayerTilePos = currentTilePos;
	}
};

const updateGasDamage = () => {
	const { health, maskName } = state.value;
	const inGas = lever.on && state.value.inGas != "none" && maskName !== "red";
	const newHealth = clamp(health + (inGas ? -2 : 4), 0, 100);
	if (newHealth !== health) updateState({ health: newHealth });
};
