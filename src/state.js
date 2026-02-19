// player state
const playerState = signal({ maskName: "none", inGas: false, health: 100 });
const initializePlayerState = () => {
	playerState.value = { maskName: "none", inGas: false, health: 100 };
};
const updatePlayerState = (updates) => {
	playerState.value = { ...playerState.value, ...updates };
};

// effects are called when the playerState is changed
playerState.effect(() => {
	if (playerState.value.health === 0) {
		player.pos = vec2(0);
		updatePlayerState({ health: 100 });
	}
});

const updatePlayerMask = (maskName) =>
	updatePlayerState({ maskName: maskName });

let lastPlayerTilePos = null;

const updateGasDetection = () => {
	const currentTilePos = player.pos.floor().add(vec2(16));
	if (!lastPlayerTilePos || currentTilePos.distance(lastPlayerTilePos) >= 1) {
		// TODO get the color of the gas from the tile index
		updatePlayerState({ inGas: gl.getData(currentTilePos).tile });
		lastPlayerTilePos = currentTilePos;
	}
};

const updateGasDamage = () => {
	const damagePlayer = (amount = 1) =>
		updatePlayerState({
			health: clamp(playerState.value.health - amount, 0, 100),
		});
	const canSurviveGas = () => playerState.value.maskName === "red";
	if (lever.on && playerState.value.inGas && !canSurviveGas()) damagePlayer(1);
	else damagePlayer(-1);
};
