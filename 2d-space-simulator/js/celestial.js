/*------GALAXY CLASS------*/

class Galaxy {
	constructor(data, universe) {
		this.universe = universe;
		this.uid = data.uid;
		this.id = data.id;
		this.name = data.name;
		this.type = "Galaxy",
		this.sector = data.sector;
		this.position = new Vector(0, 0);
		this.radius = 1e12;
		this.satellites = [];
	}

	getSector() {
		return this.sector.copy();
	}

	getPosition() {
		return this.position.copy();
	}
}


/*------MAIN CELESTIAL CLASS------*/

class Celestial {
	constructor(data, universe) {
		this.universe = universe;
		this.uid = data.uid;
		this.id = data.id;
		this.name = data.name;
		this.parent = data.parent;
		this.position = new Vector(0, 0);
		this.type = "Celestial";
		this.satellites = [];
		this.spacecrafts = [];
	}

	getOuterGravityField() {
		return Vector.fromAngle(this.innerGravityField / this.orbitRadius, this.orbitRadius + this.innerGravityField).subtract(new Vector(this.orbitRadius, 0)).length;
	}
}


/*------STAR CLASS------*/

class Star extends Celestial {
	constructor(data, universe) {
		super(data, universe);
		this.parent.satellites.push(this);
		this.allSatellites = [];
		this.type = "Star";
		this.sector = data.sector;
		this.mass = data.mass;
		this.radius = data.radius;
		this.innerGravityField = universe.SECTOR_SIZE * 0.9;
		this.outerGravityField = this.innerGravityField;
	}

	updatePosition() {
		/*
		This function has to be empty, because the universe
		updates positions of every celestial, but stars don't
		change their positions
		*/
	}

	getPosition() {
		return this.position.copy();
	}

	getSector() {
		return this.sector.copy();
	}
}

/*------PLANETS AND MOONS SHARED CLASS------*/

class OrbitingCelestial extends Celestial {
	constructor(data, universe) {
		super(data, universe)

		this.orbitRadius = data.orbitRadius;
		this.orbitInitialAngle = data.orbitInitialAngle;
		this.orbitDirection = ph(data.orbitDirection, 1);
		this.mass = data.mass;
		this.radius = data.radius;
		this.period = Math.PI*2 * Math.sqrt(Math.pow(this.orbitRadius, 3) / (universe.G * this.parent.mass));
		this.velocity = Math.sqrt(universe.G * this.parent.mass / this.orbitRadius);
	}

	getTrueAnomalyAtTime(time) {
		return this.orbitInitialAngle + this.orbitDirection * Math.PI*2 * time / this.period;
	}

	getPositionAtTime(time) {
		return Vector.fromAngle(this.getTrueAnomalyAtTime(time), this.orbitRadius);
	}

	updatePosition(time) {
		this.position = this.getPositionAtTime(time);
		this.trueAnomaly = this.getTrueAnomalyAtTime(time);
	}

	getSector() {
		return this.parent.getSector();
	}
}


/*------PLANET CLASS------*/

class Planet extends OrbitingCelestial {
	constructor(data, universe) {
		super(data, universe);

		this.type = "Planet";
		this.innerGravityField = 500000 * Math.pow(universe.G * this.mass, 1/4);
		this.outerGravityField = this.getOuterGravityField();
		this.parent.satellites.push(this);
		this.parent.allSatellites.push(this);
	}

	recalculate() {
		this.satellites.sort((a, b) => a.orbitRadius - b.orbitRadius);
		let furthest = this.satellites[this.satellites.length-1];
		this.gravityField = Math.max(
			this.gravityField,
			furthest.orbitRadius + furthest.gravityField * 4
		);
	}

	getPosition() {
		return this.position.copy();
	}
}


/*------MOON CLASS------*/

class Moon extends OrbitingCelestial {
	constructor(data, universe) {
		super(data, universe);

		this.type = "Moon";
		/*this.innerGravityField = Math.sqrt(
			universe.G * this.mass * Math.pow(this.orbitRadius, 2)
			/ (universe.G * this.parent.mass)
		);*/
		this.innerGravityField = 25000 * Math.pow(universe.G * this.mass, 1/4);
		console.log("Moon innerGravityField:", this.innerGravityField);
		this.outerGravityField = this.getOuterGravityField();
		this.parent.satellites.push(this);
		this.parent.parent.allSatellites.push(this);
		this.parent.recalculate();
	}

	getPosition() {
		return this.parent.getPosition().add(this.position);
	}
}
