const levels = [
	{
		name: "level one",
		pipes: [
			// red line
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
			...pipeLine([vec2(27, 0), vec2(27, 11), vec2(18, 11)]),
		],
		gases: [...cloud("red", vec2(15, 15), vec2(23, 10)), ...cloud("red", vec2(28, 17), vec2(30, 7))],
		valves: [],
	},
	{
		name: "demo level",
		pipes: [
			// a line of pipe tiles with the given position and length
			...pipeSection(18, 20, 23),
			...pipeSection(24, 16, 15),
			...pipeSection(24, 10, 6, "vertical"),

			// multiple pipe sections connected by corners at the given positions
			// TODO use vec2
			...pipeLine([
				vec2(1, 18),
				{ x: 15, y: 18 },
				{ x: 15, y: 25 },
				{ x: 5, y: 25 },
				{ x: 5, y: 28 },
				{ x: 3, y: 28 },
				{ x: 3, y: 23 },
			]),

			// generates a maze of pipeLines with the given size
			...mazePattern(7, 4),
		],
		gases: [
			// a cloud of gas at the given position
			// ...cloudSimple(24, 17),
		],
		valves: [],
	},
];
