const levels = [
	{
		name: "level one",
		pipes: [
			...pipeLine([
				vec2(-3, -16),
				vec2(-3, -13),
				vec2(6, -13),
				vec2(6, -8),
				vec2(1, -8),
				vec2(1, -11),
				vec2(-3, -11),
				vec2(-16, -11),
			]),
			...pipeLine([
				vec2(-11, -16),
				vec2(-11, -8),
				vec2(-2, -8),
				vec2(-2, 0),
				vec2(-11, 0),
			]),
			...pipeLine([
				vec2(15, -11),
				vec2(10, -11),
				vec2(10, -2),
				vec2(2, -2),
				vec2(2, 0),
			]),
			...pipeLine([vec2(16, 2), vec2(0, 2), vec2(0, 4), vec2(16, 4)]),
			...pipeLine([vec2(11, -16), vec2(11, -4), vec2(2, -4)]),
			{ x: -6, y: 0, value: pipe("leaking", "up", true, 1, "blue") },
			{ x: 11, y: -8, value: pipe("leaking", "right") },
			{ x: 6, y: -4, value: pipe("leaking", "down") },
		],
		gases: [
			...cloud("red", vec2(-1, 1), vec2(7, -6)),
			...cloud("red", vec2(12, 1), vec2(14, -9)),
			...cloud("blue", vec2(-8, 8), vec2(-4, 1)),
		],
		leversData: [{ value: "red", pos: vec2(13.5, -10) }],
		masksData: [
			{ value: "red", pos: vec2(-9, -9) },
			{ value: "blue", pos: vec2(10, 0.5) },
		],
		startPos: vec2(0, -14),
	},
];
