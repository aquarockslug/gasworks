local function build(files)
	print("Building game...")
	os.execute("zip index.zip " .. table.concat(files, " "))
end

local function push(file, address, channel)
	local target = string.format("%s:%s", address, channel)
	print(string.format("\nUploading %s to %s", file, target))
	os.execute(string.format("butler push %s %s", file, target))
end

build({
	"./index.html",
	"./assets/masks.png",
	"./assets/pipes.png",
	"./assets/gorm.png",
	"./src/game.js",
	"./src/grid.js",
	"./src/objects.js",
	"./src/gameData.js",
	"./src/levels.js",
	"./src/tileData.js",
	"./lib/littlejs.js",
	"./lib/signals.js"
})
push("./index.zip", "aquarock/gas-game", "html5")
