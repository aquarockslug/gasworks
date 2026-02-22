// Global game variables
let player, lever, mask, gasAnimTime, pipeData, gasData, pl, gl, grl;
const state = signal({ maskName: "none", inGas: false, health: 100 });

// player state
const initializePlayerState = (v) => {
	state.value = v;
	return state;
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
	if (!lastPlayerTilePos || currentTilePos.distance(lastPlayerTilePos) >= 1) {
		// TODO get the color of the gas from the tile index
		updateState({ inGas: "none" });
		let t = gl.getData(currentTilePos).tile;
		if (t == gas("red", 0)) updateState({ inGas: "red" });
		if (t == gas("red", 1)) updateState({ inGas: "red" });
		if (t == gas("red", 2)) updateState({ inGas: "red" });
		if (t == gas("red", 3)) updateState({ inGas: "red" });
		if (t == gas("red", 4)) updateState({ inGas: "red" });
		if (t == gas("red", 5)) updateState({ inGas: "red" });
		if (t == gas("red", 6)) updateState({ inGas: "red" });
		if (t == gas("red", 7)) updateState({ inGas: "red" });
		if (t == gas("red", 8)) updateState({ inGas: "red" });
		lastPlayerTilePos = currentTilePos;
	}
};

const updateGasDamage = () => {
	const damagePlayer = (amount = 1) =>
		updateState({
			health: clamp(state.value.health - amount, 0, 100),
		});
	const canSurviveGas = () => state.value.maskName === "red";
	if (lever.on && state.value.inGas != "none" && !canSurviveGas())
		damagePlayer(2);
	else damagePlayer(-2);
};
