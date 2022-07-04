function getModel(universe) {
	/*
	This is not a model from MVC, but a universe model.
	Stars are sector-centered.
	*/

	function getSector(position) {
		let sectorSize = universe.SECTOR_SIZE;
		let x = Math.sign(position.x) * Math.floor(
				(Math.abs(position.x) + sectorSize) / (sectorSize * 2)
			),
			y = Math.sign(position.y) * Math.floor(
				(Math.abs(position.y) + sectorSize) / (sectorSize * 2)
			);
		return new Vector(x, y);
	}

	/*
	Stan planet na czas 2020.03.21 23:10 UTC
	Prawdziwe anomalie zmierzone na solarsystemscope.com
	*/

	/*------GALAXY (MILKY WAY)------*/

	let milkyWay = new Galaxy({
		uid: "283847102",
		id: "1",
		name: "Droga Mleczna",
		sector: getSector(new Vector(0, 0)),
	}, universe);

	/*------STAR (SUN)------*/

	let sun = new Star({
		parent: milkyWay,
		uid: "389218379",
		id: "1.1",
		name: "Słońce",
		sector: getSector(Vector.fromAngle(toRadians(90), toMeters(26038))),
		mass: 1.9891e+30,
		radius: 696342000,
	}, universe);

	/*------PLANET (MERCURY)------*/

	let mercury = new Planet({
		parent: sun,
		uid: "735274275",
		id: "1.1.1",
		name: "Merkury",
		orbitRadius: 57909170000,
		orbitInitialAngle: toRadians(243.5),
		mass: 3.302e+23,
		radius: 2440000,
	}, universe);

	/*------PLANET (VENUS)------*/

	let venus = new Planet({
		parent: sun,
		uid: "758360164",
		id: "1.1.2",
		name: "Wenus",
		orbitRadius: 108208926000,
		orbitInitialAngle: toRadians(135),
		mass: 4.868e+24,
		radius: 6052000,
	}, universe);

	/*------PLANET (EARTH)------*/

	let earth = new Planet({
		parent: sun,
		uid: "847395385",
		id: "1.1.3",
		name: "Ziemia",
		orbitRadius: 149597887000,
		orbitInitialAngle: toRadians(181.5),
		mass: 5.974e+24,
		radius: 6371000,
	}, universe);

	/*------MOON (MOON)------*/

	let moon = new Moon({
		parent: earth,
		uid: "573957245",
		id: "1.1.3.1",
		name: "Księżyc",
		orbitRadius: 384400000,
		orbitInitialAngle: toRadians(335),
		mass: 7.35e+22,
		radius: 1737000
	}, universe);

	/*------PLANET (MARS)------*/

	let mars = new Planet({
		parent: sun,
		uid: "857205633",
		id: "1.1.4",
		name: "Mars",
		orbitRadius: 227936637000,
		orbitInitialAngle: toRadians(256),
		mass: 6.419e+23,
		radius: 3402500,
	}, universe);

	/*------PLANET (JUPITER)------*/

	let jupiter = new Planet({
		parent: sun,
		uid: "913775422",
		id: "1.1.5",
		name: "Jowisz",
		orbitRadius: 778412027000,
		orbitInitialAngle: toRadians(283),
		mass: 1.898600e+27,
		radius: 71492000,
	}, universe);

	/*------PLANET (SATURN)------*/

	let saturn = new Planet({
		parent: sun,
		uid: "926357486",
		id: "1.1.6",
		name: "Saturn",
		orbitRadius: 1426725413000,
		orbitInitialAngle: toRadians(295),
		mass: 5.68516e+26,
		radius: 60268000,
	}, universe);

	/*------PLANET (URANUS)------*/

	let uranus = new Planet({
		parent: sun,
		uid: "957377545",
		id: "1.1.7",
		name: "Uran",
		orbitRadius: 2870972220000,
		orbitInitialAngle: toRadians(36),
		mass: 8.6841e+25,
		radius: 25559000,
	}, universe);

	/*------PLANET (NEPTUNE)------*/

	let neptune = new Planet({
		parent: sun,
		uid: "975857775",
		id: "1.1.8",
		name: "Neptun",
		orbitRadius: 4498252900000,
		orbitInitialAngle: toRadians(349),
		mass: 1.02439e+26,
		radius: 24764000,
	}, universe);


	let galaxies = [
		milkyWay
	];


	let model = {
		spacecrafts: [
			{
				uid: "038947285",
				name: "Test rocket",
				modules: [
					{
						uid: "364729173",
						x: 0,
						y: 5
					}
				]
			}
		],
		spacecraftModules: {
			sets: {
				test_set: [
					{
						uid: "364729173",
						name: "Main Module",
						hitboxes: [
							{
								x: -1,
								y: 5,
								width: 2,
								height: 10
							}
						],
						image: {
							src: "spacecraft_modules/test_set/main_module.svg",
							x: -1,
							y: -5,
							width: 2,
							height: 10
						},
						engines: [
							{
								x: 0,
								y: -5,
								r: 1
							}
						]
					}
				]
			}
		}
	};

	return {
		galaxies: galaxies,
		model: model
	};
}
