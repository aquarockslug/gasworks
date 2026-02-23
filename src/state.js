// Global game variables
let player, lever, mask, gasAnimTime, pipeData, gasData, pl, gl, grl;
const state = signal({ maskName: "none", inGas: false, health: 100 });

// player state
const initializePlayerState = (v) => {
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
		// TODO get the color of the gas from the tile index
		let t = gl.getData(currentTilePos).tile;
		console.log("🪚 t:", t);
		if (!t) updateState({ inGas: "none" });
		// the animations change the tile index
		if (t == gas("red", 8)) updateState({ inGas: "red" });
		if (t == gas("red", 8) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 8) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 7)) updateState({ inGas: "red" });
		if (t == gas("red", 7) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 7) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 6)) updateState({ inGas: "red" });
		if (t == gas("red", 6) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 6) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 5)) updateState({ inGas: "red" });
		if (t == gas("red", 5) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 5) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 4)) updateState({ inGas: "red" });
		if (t == gas("red", 4) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 4) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 3)) updateState({ inGas: "red" });
		if (t == gas("red", 3) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 3) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 2)) updateState({ inGas: "red" });
		if (t == gas("red", 2) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 2) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 1)) updateState({ inGas: "red" });
		if (t == gas("red", 1) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 1) + 6) updateState({ inGas: "red" });
		if (t == gas("red", 0)) updateState({ inGas: "red" });
		if (t == gas("red", 0) + 3) updateState({ inGas: "red" });
		if (t == gas("red", 0) + 6) updateState({ inGas: "red" });

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
		damagePlayer(1);
	else damagePlayer(-2);
};
