const levels = [
	{
		name: "level one",
		pipes: [
			...pipeLine([
				vec2(13, 0),
				vec2(13, 3),
				vec2(22, 3),
				vec2(22, 8),
				vec2(17, 8),
				vec2(17, 5),
				vec2(13, 5),
				vec2(0, 5),
			]),
			...pipeLine([
				vec2(5, 0),
				vec2(5, 8),
				vec2(14, 8),
				vec2(14, 16),
				vec2(5, 16),
			]),
			...pipeLine([
				vec2(31, 5),
				vec2(26, 5),
				vec2(26, 14),
				vec2(18, 14),
				vec2(18, 16),
			]),
			...pipeLine([vec2(27, 0), vec2(27, 12), vec2(18, 12)]),
			{ x: 10, y: 16, value: pipe("leaking", "up") },
			{ x: 27, y: 8, value: pipe("leaking", "right") },
			{ x: 22, y: 12, value: pipe("leaking", "down") },
		],
		gases: [
			...cloud("red", vec2(15, 15), vec2(23, 10)),
			...cloud("red", vec2(28, 17), vec2(30, 7)),
			...cloud("red", vec2(8, 24), vec2(12, 17)),
		],
		levers: [{ name: "red", pos: vec2(13, -10) }],
		startPos: vec2(0, -14),
	},
];
