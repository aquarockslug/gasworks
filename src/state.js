// Global game variables
let player, lever, mask, gasAnimTime, pipeData, gasData, pl, gl, grl;
const state = signal({ maskName: "none", inGas: false, health: 100 });

// player state
const initializePlayerState = () => {
	state.value = { maskName: "none", inGas: false, health: 100 };
};
const updateState = (updates) => {
	state.value = { ...state.value, ...updates };
};

// effects are called when the state is changed
state.effect(() => {
	if (state.value.health === 0) {
		player.pos = vec2(0);
		updateState({ health: 100 });
	}
});

const updatePlayerMask = (maskName) => updateState({ maskName: maskName });

let lastPlayerTilePos = null;

const updateGasDetection = () => {
	const currentTilePos = player.pos.floor().add(vec2(16));
	if (!lastPlayerTilePos || currentTilePos.distance(lastPlayerTilePos) >= 1) {
		// TODO get the color of the gas from the tile index
		updateState({ inGas: gl.getData(currentTilePos).tile });
		lastPlayerTilePos = currentTilePos;
	}
};

const updateGasDamage = () => {
	const damagePlayer = (amount = 1) =>
		updateState({
			health: clamp(state.value.health - amount, 0, 100),
		});
	const canSurviveGas = () => state.value.maskName === "red";
	if (lever.on && state.value.inGas && !canSurviveGas()) damagePlayer(1);
	else damagePlayer(-1);
};
