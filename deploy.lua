local push = function(file, address, channel)
	print(string.format("Uploading %s to %s:%s", file, address, channel))
	os.execute(string.format("butler push %s %s:%s", file, address, channel))
end

os.execute("zip index.zip ./index.html ./assets/masks.png ./assets/pipes.png ./assets/gorm.png ./src/game.js ./src/objects.js ./src/game-data.js ./lib/littlejs.js")

push("./index.zip", "aquarock/gas-game", "html5")
