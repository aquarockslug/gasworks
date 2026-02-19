const levels = [
	{
		pipes: [
			// a line of pipe tiles with the given position and length
			...pipeSection(18, 20, 23),
			...pipeSection(24, 16, 15),
			...pipeSection(24, 10, 6, "vertical"),

			// multiple pipe sections connected by corners at the given positions
			...pipeLine([
				{ x: 1, y: 18 },
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
			...cloud(24, 17),
		],
		valves: [],
	},
];
