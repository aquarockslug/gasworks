// player state 
const playerState = signal({ maskName: "none", inGas: false, health: 100 });
const updatePlayerState = (updates) => playerState.value = { ...playerState.value, ...updates };

// setters
const updatePlayerMask = (maskName) => updatePlayerState({ maskName: maskName });
const setPlayerInGas = (inGas) => updatePlayerState({ inGas: inGas }); // TODO get the color of the gas from the tile index
const damagePlayer = (amount = 1) => {
	updatePlayerState({ health: clamp(playerState.value.health - amount, 0, 100) })
	if (playerState.value.health === 0) resetPlayer()
};

const resetPlayer = () => {
	player.pos = vec2(0);
	updatePlayerState({ health: 100 });
};

// getters
const canSurviveGas = () => playerState.value.maskName === "red";

let lastPlayerTilePos = null;

const updateGasDetection = () => {
	const currentTilePos = player.pos.floor().add(vec2(16));
	if (!lastPlayerTilePos || currentTilePos.distance(lastPlayerTilePos) >= 1) {
		setPlayerInGas(gl.getData(currentTilePos).tile);
		lastPlayerTilePos = currentTilePos;
	}
};

const updateGasDamage = () => {
	if (lever.on && playerState.value.inGas && !canSurviveGas()) damagePlayer(1);
	else damagePlayer(-1);
};

const initializePlayerState = () => {
  playerState.value = { maskName: "none", inGas: false, health: 100 };
  // playerState.effect(() => console.log('Player state updated:', playerState.value));
};
