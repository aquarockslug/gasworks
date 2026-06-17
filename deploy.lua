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
	"./baskarstc.otf",
	"./assets/masks.png",
	"./assets/tiles.png",
	"./assets/gorm.png",
	"./assets/concrete.jpg",
	"./src/game.js",
	"./src/menu.js",
	"./src/objects.js",
	"./src/gameData.js",
	"./src/levels.js",
	"./src/tileData.js",
	"./lib/littlejs.js",
})
push("./index.zip", "aquarock/gas-game", "html5")
