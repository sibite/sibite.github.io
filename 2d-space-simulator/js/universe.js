class Universe {
	constructor(savedWorld) {
		/*------GENERATING UNIVERSE MODEL (TEMPORARY)*/

		/*------CONSTANTS------*/
		this.SECTOR_SIZE = 5e+13;
		this.G = 6.674e-11;

		/*------VARIABLES------*/
		this.time = 0;
		this.timeSpeed = 1;
		this.frameTime = 0;
		this.realFrameTime = 0;
		this.currentSpacecraft = null;
		this.paused = true;

		/*------OBJECTS------*/
		this.publisher = new Publisher();

		/*------UNIVERSE STRUCTURE------*/

		let model = getModel(this);
		this.allCelestials = {};
		this.galaxies = model.galaxies;

		/*------GENERATING ALL CELESTIALS LIST------*/
		this.galaxies.forEach(function(galaxy) {
			galaxy.satellites.forEach(function(star) {
				this.allCelestials[star.uid] = star;
				star.satellites.forEach(function(planet) {
					this.allCelestials[planet.uid] = planet;
					planet.satellites.forEach(function(moon) {
						this.allCelestials[moon.uid] = moon;
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
		/*------GALAXIES------*//*
		this.galaxies = [];
		model.universe.galaxies.forEach(function(galaxy) {
			let galaxyObject = new Galaxy(galaxy, this);

			/*------STARS------*//*
			let stars = [];
			galaxy.stars.forEach(function(star) {
				let starObject = new Star(star, this);

				/*------PLANETS------*//*
				let planets = [];
				star.planets.forEach(function(planet) {
					let planetObject = new Planet(planet, this);

					/*------MOONS------*//*
					planet.moons.forEach(function(moon) {
						let moonObject = new Moon(moon, this);
						planetObject.addSatellite(moonObject);
						this.allCelestials[moonObject.uid] = moonObject;
					}.bind(this));
					/*------PLANET CONTINUATION------*//*
					starObject.addSatellite(planetObject);
					this.allCelestials[planetObject.uid] = planetObject;
				}.bind(this));
				/*------STAR CONTINUATION------*//*
				galaxyObject.addSatellite(starObject);
				this.allCelestials[starObject.uid] = starObject;
			}.bind(this));
			/*------GALAXY CONTINUATION------*//*
			this.galaxies.push(galaxyObject);
		}.bind(this));
		/*------END GALAXIES------*/


		/*------BLUEPRINTS------*/

		/*------ROCKET MODULES------*/
		let spacecraftModules = {};
		Object.keys(model.model.spacecraftModules.sets).forEach(function(setKey) {
			model.model.spacecraftModules.sets[setKey].forEach(function(spacecraftModule) {
				spacecraftModules[spacecraftModule.uid] = spacecraftModule;
			})
		});

		/*------ROCKETS------*/
		let spacecrafts = {};
		model.model.spacecrafts.forEach(function(spacecraft) {
			spacecrafts[spacecraft.uid] = spacecraft;
		})

		this.blueprints = {
			spacecraftModules: spacecraftModules,
			spacecrafts: spacecrafts
		};

		/*------ARRAYS------*/
		this.spacecrafts = [];
	}

	putSpacecraft(spacecraft, orbitedBody) {
		orbitedBody.spacecrafts.push(spacecraft);
		this.spacecrafts.push(spacecraft);
		spacecraft.calculateTrajectory(orbitedBody, this.time);
	}

	removeSpacecraft(spacecraft) {
		this.spacecrafts.splice(this.spacecrafts.indexOf(spacecraft));
	}

	resume() {
		this.lastFrameTime = Date.now();
		this.paused = false;
		this.nextFrame();
	}

	pause() {
		this.paused = true;
	}

	nextFrame() {
		if (this.paused) {
			return;
		}
		/*------CALCULATING TIME------*/
		let now = Date.now();
		this.realFrameTime = (now - this.lastFrameTime) / 1000;
		this.frameTime = this.realFrameTime * this.timeSpeed;
		this.lastFrameTime = now;
		this.time += this.frameTime;
		//console.log(1 / (this.frameTime / this.timeSpeed));

		/*------EXECUTING QUEUED EVENTS------*/

		while (this.view.eventQueue.length > 0) {
			this.view.eventQueue.shift()();
		}

		this.view.eventHandler.handleKeyboard();

		/*------PUBLISHING NEW FRAME------*/
		/*(To animations)*/
		this.publisher.publish("realNextFrame", {deltaTime: this.realFrameTime * 1000});

		/*------UPDATING CELESTIAL POSITIONS------*/
		Object.keys(this.allCelestials).forEach(function(key) {
			this.allCelestials[key].updatePosition(this.time);
		}.bind(this));

		/*------MOVING SPACECRAFTS------*/
		this.spacecrafts.forEach(function(spacecraft) {
			spacecraft.updatePosition(this.time, this.frameTime);
		}.bind(this));

		/*------INFORMING VIEW TO RENDER------*/
		if (this.view) {
			this.view.render();
		}
	}
}
