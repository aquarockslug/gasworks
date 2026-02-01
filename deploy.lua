local push = function(file, address, channel)
	print(highlight(string.format(highlight("Uploading") .. " %s to %s:%s", file, address, channel)))
	os.execute(string.format("butler push %s %s:%s", file, address, channel))
end

os.execute("zip index.zip ./index.html ./pipes.png ./gorm.png game.js littlejs.js")
-- push("./index.html", "aquarock/gas-game", "html5")
