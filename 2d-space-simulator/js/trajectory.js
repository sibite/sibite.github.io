class Trajectory {

	constructor(universe, spacecraft) {
		this.orbits = [];
		this.universe = universe;
		this.spacecraft = spacecraft;
	}

	calculate(r, v, orbitedBody, time) {
		this.orbits = [];
		let orbit = new Orbit(r, v, orbitedBody, this.universe, time);
		//console.log("orbit:", orbit);
		this.orbits.push(orbit);

		//console.log("Calculating trajectory");

		while(true) {
			let lastOrbit = this.getLastOrbit();
			if (lastOrbit.orbitedBody.type != "Star") {
				lastOrbit.checkForOrbitExit();
			}
			let orbitChange = lastOrbit.checkForOrbitChange();
			if (orbitChange.orbit) {
				console.log("orbitChange:", orbitChange);
				this.orbits.push(orbitChange.orbit);
			}
			else {
				break;
			}
		}
	}

	refreshOrbitChange() {
		let currentOrbit = this.getCurrentOrbit();
		if (currentOrbit.orbitChange.orbit == false) {
			while(true) {
				let lastOrbit = this.getLastOrbit();
				if (lastOrbit.orbitedBody.type != "Star" && lastOrbit != currentOrbit) {
					lastOrbit.checkForOrbitExit();
				}
				let orbitChange = lastOrbit.checkForOrbitChange();
				if (orbitChange.orbit) {
					console.log("orbitChange:", orbitChange);
					this.orbits.push(orbitChange.orbit);
				}
				else {
					break;
				}
			}
		}
	}

	getCurrentOrbit() {
		return this.orbits[0];
	}

	getLastOrbit() {
		return this.orbits[this.orbits.length - 1];
	}

	getState(time) {
		/*
		M -> mean anomaly
		E -> eccentric anomaly
		H -> hyperbolic eccentric anomaly
		n -> mean motion [angle/s]
		*/
		let orbit = this.getCurrentOrbit();
		while (time > orbit.orbitChange.time) {
			orbit.orbitedBody.spacecrafts.delete(this.spacecraft);
			this.orbits.shift();
			orbit = this.getCurrentOrbit();
			orbit.orbitedBody.spacecrafts.push(this.spacecraft);
		}
		if (orbit) {
			let n = orbit.n,
				e = orbit.e.length;

			/*------FOR ELLIPSE ORBITS------*/
			if (e < 1) {
				/*------EVALUATING STARTING VALUE------*/
				let M = mod2(n*(time - orbit.tp), Math.PI*2),
					E,
					dE,
					iterations = 0;
				if (orbit.E == undefined) {
					E = M + e * Math.sin(M) / Math.sqrt(1 - 2*e * Math.cos(M) + e*e);
				} else {
					E = orbit.E;
				}

				/*------FINDING E BY NEWTON'S ITERATION METHOD------*/
				E = orbit.calculateE(M, E);
				orbit.E = E;

				/*------CONVERTING E TO STATE------*/
				var position = orbit.getPositionFromE(E);
				var velocity = orbit.getPositionFromE(E+0.000000001).subtract(position);
			}

			/*------FOR HYPERBOLIC ORBITS------*/
			else {
				/*------EVALUATING STARTING VALUE------*/
				let M2 = n*(time - orbit.tp),
					absM2 = Math.abs(M2),
					M = absM2 > 690 ? 690 * Math.sign(M2) : M2,
					H,
					dH,
					iterations = 0;
				if (orbit.H == undefined) {
					H = M;
				} else {
					H = orbit.H;
				}

				if (absM2 <= 690) {
					/*------FINDING H BY NEWTON'S ITERATION METHOD------*/
					H = orbit.calculateH(M2, H);
				}
				/*-----------------
				IF M > 700 (sinh(M) > Number.MAX_VALUE)
				THEN CALCULATE NEXT PART OF H LINEAR
				-----------------*/
				else {
					let sinhH = Math.sinh(orbit.H690) + (M2 - M) * orbit.H690plusYfactor;
					H = Math.log(sinhH + Math.sqrt(sinhH*sinhH + 1));
				}

				orbit.H = H;

				/*------CONVERTING H TO STATE------*/
				var position = orbit.getPositionFromH(H);
				var velocity = orbit.getPositionFromH(H+0.000000001).subtract(position);
			}
			/*------RETURNING THE POSITION------*/
			position.angle += orbit.e.angle;
			velocity.angle += orbit.e.angle;
			velocity.length = Math.sqrt(
				this.universe.G * orbit.orbitedBody.mass
				* (2/position.length - 1/orbit.a)
			);

			return {
				position: position,
				velocity: velocity
			};
		}
	}
}

class Orbit {
	constructor(r, v, orbitedBody, universe, time) {
		/*
		------STARTING PARAMETERS------
		v -> velocity vector
		r -> position vector
		gm -> gravitional parameter (G*M)

		------PROPERTIES------
		e -> eccentricity
		a -> semi-major axis
		b -> semi-minor axis
		f -> focal length
		period -> orbital period
		tp -> periapsis time
		direction -> clockwise (-1) or anticlockwise (1)

		------ANOMALIES------
		trueAnomaly -> true anomaly
		n -> mean move [M / second]
		M -> mean anomaly
		E -> eccentric anomaly
		H -> hyperbolic eccentric anomaly
		*/

		/*------PROPERTIES------*/
		this.universe = universe;
		this.enterTime = time;
		let gm = universe.G * orbitedBody.mass;

		if (v.length == 0) {
			v.x = 0.00000001;
		}

		/*------ECCENTRICITY VECTOR, ANGLE AND DIRECTION------*/
		let angle = v.angle - r.angle,
			vSin = Math.sin(angle),
			h = v.length*r.length*vSin,
			ev1 = v.toLength(h*v.length/gm);
			ev1.angle -= Math.PI/2;
		let	ev2 = r.toFactor(),
			e = ev1.copy().subtract(ev2),
			trueAnomaly = (r.angle - e.angle) % (Math.PI*2),
			direction = vSin < 0 ? -1 : 1;

		/*------OTHER ORBITAL ELEMENTS------*/
		let a = h*h/(gm*(1-e.length*e.length)),
			n = Math.sqrt(gm / Math.abs(Math.pow(a, 3)));

		/*------ELLIPTIC CASE------*/
		if (e.length < 1) {
			this.ellipse = new Ellipse(a, e.length);
			let b = this.ellipse.b,
				f = this.ellipse.f;

			/*------CALCULATING PERIOD------*/
			let period = 2*Math.PI*Math.sqrt(a*a*a/gm)

			/*------SETTING PROPERTIES------*/
			this.e = e;
			this.a = a;
			this.b = b;
			this.f = f;
			this.n = n;
			this.periapsis = a - f;
			this.apoapsis = a + f;
			this.period = period;
			this.direction = direction;
			this.orbitedBody = orbitedBody;

			/*------ELLIPSE POINTS------*/

			/*------FIRST QUARTER------*/
			let points = [];
			for (let degrees = 0; degrees <= 90; degrees += 1) {
				points.push(this.ellipse.getPointFromSideAngle(toRadians(degrees)));
			}

			/*------OTHER 3 QUARTERS------*/
			let l = points.length;
			for (let i = 0; i < l; i++) {
				let p = points[i];
				points[l*2-2 - i] = {x: -p.x, y: p.y};
				points[l*2-2 + i] = {x: -p.x, y: -p.y};
				points[l*4-4 - i] = {x: p.x, y: -p.y};
			}
			points.pop();
			points.forEach(point => point.x -= f);

			/*------ROTATING POINTS------*/
			let absPoints = [];
			points.forEach(point => {
				let absPoint = new Vector(point.x, point.y);
				absPoint.angle += e.angle;
				absPoints.push(absPoint);
			});


			/*------CALCULATING PERIAPSIS TIME------*/
			let rotR = r.toAngle(r.angle - e.angle);
			let cosE = rotR.x / a + e.length,
				sinE = rotR.y / b * direction,
				E = Math.atan2(sinE, cosE),
				M = this.getMfromE(E),
				tp = time - M / n;

			/*------SETTING PROPERTIES------*/
			this.tp = tp;
			this.points = points;
			this.absPoints = absPoints;
		}

		/*------HYPERBOLIC CASE------*/
		else {
			this.hyperbola = new Hyperbola(a, e.length);
			let b = this.hyperbola.b,
				f = this.hyperbola.f;

			/*------SETTING PROPERTIES------*/
			this.e = e;
			this.a = a;
			this.b = b;
			this.f = f;
			this.n = n;
			this.periapsis = a - f;
			this.apoapsis = Infinity;
			this.period = Infinity;
			this.direction = direction;
			this.orbitedBody = orbitedBody;

			/*------CALCULATING H VALUES IMPORTANT TO POSITION CALCULATION------*/
			this.H690 = this.calculateH(690, 690);
			this.H689 = this.calculateH(689, 689);
			this.H690plusYfactor = Math.sinh(this.H690) - Math.sinh(this.H689);

			/*------CALCULATING PERIAPSIS TIME------*/
			let rotR = r.toAngle(r.angle - e.angle),
				sinhH = rotR.y / b * direction,
				H = Math.log(sinhH + Math.sqrt(sinhH*sinhH + 1)),
				M = this.getMfromH(H),
				tp = time - M / n;

			/*------CALCULATING POINTS------*/
			let points = [],
				absPoints = [],
				position;

			for (let degrees = 0; degrees <= toDegrees(this.hyperbola.maxAngle); degrees += 1) {
				position = this.hyperbola.getPointFromSideAngle(toRadians(degrees));
				points.push({x: position.x - this.f, y: position.y});
				points.unshift({x: position.x - this.f, y: -position.y});
			}
			let minY = position ? position.y : 0;
			position = this.hyperbola.getPointFromSideAngle(this.hyperbola.maxAngle - 0.00000001);
			let	multiplier = this.universe.SECTOR_SIZE * 2 / position.length;
			if (position.y * multiplier > minY) {
				points.push({x: position.x*multiplier - this.f, y: position.y*multiplier});
				points.unshift({x: position.x*multiplier - this.f, y: -position.y*multiplier});
			}

			/*------ROTATING POINTS------*/
			points.forEach(point => {
				let absPoint = new Vector(point.x, point.y);
				absPoint.angle += e.angle;
				absPoints.push(absPoint);
			});

			/*------SETTING PROPERTIES------*/
			this.tp = tp;
			this.points = points;
			this.absPoints = absPoints;
		}
		this.orbitChange = {
			time: Infinity,
			halfPeriodsCalculated: this.enterTime < this.tp ? -1 : 0,
			E: Infinity,
			orbit: false
		};
	}

	checkForOrbitChange() {
		/*------
		FOR ELLIPTIC ORBITS
		REAL TIME CHECKING
		------*/
		if (this.e.length < 1) {
			while (this.orbitChange.orbit == false) {
				let halfPeriodsToCalculate = Math.floor((this.universe.time - this.tp) / (this.period / 2)) + 3;
				let halfPeriodsCalculated;
				//console.log("halfPeriods:", this.orbitChange.halfPeriodsCalculated);
				if (halfPeriodsToCalculate > (halfPeriodsCalculated = this.orbitChange.halfPeriodsCalculated)) {
					this.checkForInnerOrbitChange((halfPeriodsCalculated % 2 ? -1 : 1), halfPeriodsCalculated / 2);
					this.orbitChange.halfPeriodsCalculated++;
				}
				else {
					break;
				}
			}
		}
		/*------
		FOR HYPERBOLIC ORBITS
		ONE TIME CHECKING
		------*/
		else {
			//console.log("checkForOrbitChange Hyperbola");
			this.checkForInnerOrbitChange(-1, 0);
			this.checkForInnerOrbitChange(1, 0);
		}

		return this.orbitChange;
	}

	checkForOrbitExit() {
		let figure = this.ellipse || this.hyperbola,
			getAnomalyFromPosition = (this.e.length < 1 ? this.getEfromPosition : this.getHfromPosition).bind(this),
			getMfromAnomaly = (this.e.length < 1 ? this.getMfromE : this.getMfromH).bind(this),
			c = Math.max(this.periapsis, this.orbitedBody.outerGravityField);

		//console.log("exit c:", c);

		if (c < this.apoapsis) {
			let x = figure.getXfromC(c),
				y = figure.getYfromX(x) * this.direction,
				exitE = getAnomalyFromPosition(new Vector(x - this.f, y)),
				exitTime = this.getTimeFromM(getMfromAnomaly(exitE));

			if (exitTime < this.orbitChange.time) {
				this.orbitChange.time = exitTime;
				this.orbitChange.E = exitE;
				this.orbitChange.orbit = this.getNewOuterOrbit(exitE, exitTime);
			}
		}
	}

	checkForInnerOrbitChange(yHalf, addPeriods) {
		this.orbitedBody.satellites.forEach(function(satellite) {
			let cStart = Math.max(
					this.periapsis,
					satellite.orbitRadius - satellite.innerGravityField
				),
				cEnd = Math.min(
					this.apoapsis,
					satellite.orbitRadius + satellite.innerGravityField
				);

			if (this.periapsis >= cEnd || this.apoapsis <= cStart) {
				return false;
			}

			else {
				let gravityFieldAngle = satellite.innerGravityField / satellite.orbitRadius;

				let figure = this.ellipse || this.hyperbola,
					getAnomalyFromPosition = (this.e.length < 1 ? this.getEfromPosition : this.getHfromPosition).bind(this),
					getMfromAnomaly = (this.e.length < 1 ? this.getMfromE : this.getMfromH).bind(this);

				let xStart = figure.getXfromC(cStart),
					yStart = figure.getYfromX(xStart),
					xEnd = figure.getXfromC(cEnd),
					yEnd = figure.getYfromX(xEnd),
					Estart, Eend, enterE, time;

				let getTimeFromAnomaly = function (anomaly) {
					return this.getTimeFromM(getMfromAnomaly(anomaly)) + Math.floor(addPeriods) * Math.min(Number.MAX_VALUE, this.period);
				}.bind(this);

				/*------CALCULATING START ANOMALIES BASED ON WHICH HALF IS CHECKED------*/

				if (yHalf * this.direction == 1) {
					Estart = getAnomalyFromPosition(new Vector(xStart - this.f, yStart));
					Eend = getAnomalyFromPosition(new Vector(xEnd - this.f, yEnd));
				}
				else if (yHalf * this.direction == -1) {
					Estart = getAnomalyFromPosition(new Vector(xEnd - this.f, -yEnd));
					Eend = getAnomalyFromPosition(new Vector(xStart - this.f, -yStart));
				}

				/*------STOP EXECUTION IF ENDS AT TIME BEFORE ACTUAL TIME------*/

				if (getTimeFromAnomaly(Eend) < this.universe.time) {
					return;
				}

				//console.log("Estart:", Estart);
				//console.log("Eend:", Eend);

				/*------
				STOPPING CALCULATION IF THE CHECKING ZONE
				IS ALL AFTER ACTUAL ORBIT CHANGE
				------*/

				if (Eend < this.orbitChange.E) {

				}

				let angleDiff = this.getAngleDifference(Estart, satellite, addPeriods);
				//console.log("Estart angle check");
				//console.log("leftBorder:", angleDiff - gravityFieldAngle);
				//console.log("rightBorder:", angleDiff + gravityFieldAngle);

				if (angleDiff - gravityFieldAngle < 0 && angleDiff + gravityFieldAngle > 0) {
					enterE = Estart;
					time = getTimeFromAnomaly(enterE);
				}
				if (!isset(enterE) || !(time < this.orbitChange.time && time >= this.enterTime)) {
					enterE = this.searchForEnterPoint(Estart, Eend, satellite, addPeriods, 8);
					time = getTimeFromAnomaly(enterE);
				}

				//console.log("enterE:", enterE);

				if (enterE !== false && time < this.orbitChange.time && time >= this.enterTime) {
					//console.log("addPeriods:", addPeriods);
					this.orbitChange.time = time;
					this.orbitChange.E = enterE;
					this.orbitChange.orbit = this.getNewInnerOrbit(satellite, enterE, time);
				}
			}
		}.bind(this));
	}


	/*------FUNCTIONS FOR ORBIT CHANGE CHECKING------*/

	getNewInnerOrbit(satellite, enterE, time) {
		let figure = this.ellipse || this.hyperbola,
			getPositionFromAnomaly = (this.e.length < 1 ? this.getPositionFromE : this.getPositionFromH).bind(this);

		let	satellitePosition = satellite.getPositionAtTime(time),
			satelliteTrueAnomaly = satellite.getTrueAnomalyAtTime(time),
			position = getPositionFromAnomaly(enterE),
			positionAbs = position.copy();
		positionAbs.angle += this.e.angle;
		let	radius = positionAbs.subtract(satellitePosition);

		let vAngle = figure.getSideAngleFromPoint({x: position.x + this.f, y: position.y}) + Math.PI/2 * this.direction + this.e.angle,
			vLength = this.getVfromR(position.length);
		let velocity = Vector.fromAngle(vAngle, vLength);
		velocity.subtract(Vector.fromAngle(
			satelliteTrueAnomaly + Math.PI/2 * satellite.orbitDirection,
			satellite.velocity
		));

		return new Orbit(radius, velocity, satellite, this.universe, time);
	}

	getNewOuterOrbit(exitE, time) {
		let figure = this.ellipse || this.hyperbola,
			getPositionFromAnomaly = (this.e.length < 1 ? this.getPositionFromE : this.getPositionFromH).bind(this);

		let parentPosition = this.orbitedBody.getPositionAtTime(time),
			parentTrueAnomaly = this.orbitedBody.getTrueAnomalyAtTime(time),
			position = getPositionFromAnomaly(exitE),
			positionAbs = position.copy(),
			//Do poprawy na sposób z kątami figury
			position2Abs = getPositionFromAnomaly(exitE+0.000000001);
		positionAbs.angle += this.e.angle;
		position2Abs.angle += this.e.angle;
		let radius = positionAbs.copy().add(parentPosition);

		let velocity = position2Abs.copy().subtract(positionAbs);
		velocity.length = Math.sqrt(
			this.universe.G * this.orbitedBody.mass
			* (2/position.length - 1/this.a)
		);
		let parentVelocity = Vector.fromAngle(
			parentTrueAnomaly + Math.PI/2 * this.orbitedBody.orbitDirection,
			this.orbitedBody.velocity
		);
		velocity.add(parentVelocity);

		return new Orbit(radius, velocity, this.orbitedBody.parent, this.universe, time);
	}

	searchForEnterPoint(Estart, Eend, satellite, addPeriods, iterations, prevAngle) {
		let angle = prevAngle || this.getAngleDifference(Estart, satellite, addPeriods),
			gravityFieldAngle = satellite.innerGravityField / satellite.orbitRadius,
			E = Estart,
			Echange = Eend - Estart,
			leftBorder = angle - gravityFieldAngle,
			rightBorder = angle + gravityFieldAngle,
			prevLeftBorder, prevRightBorder, prevE;

		/*------CHECKING FOR COVER IN 10 POINTS------*/

		for (let i = 1; i < iterations + 1; i++) {
			prevE = E;
			prevAngle = angle;
			prevLeftBorder = leftBorder;

			E = Estart + Echange * i/iterations;
			angle = this.getAngleDifference(E, satellite, addPeriods);

			leftBorder = angle - gravityFieldAngle;

			/*------LEFT BORDER CONDITIONAL------*/

			//console.log("leftBorder:", leftBorder);

			if (leftBorder <= 0 && prevLeftBorder > 0 && prevLeftBorder - leftBorder < Math.PI) {
				if (-leftBorder < 0.01 * gravityFieldAngle) {
					//console.log("deltaAngle:", 0.01 * gravityFieldAngle);
					return E;
				}
				else {
					return this.searchForEnterPoint(prevE, E, satellite, addPeriods, 2, prevAngle);
				}
			}

			prevRightBorder = rightBorder;
			rightBorder = angle + gravityFieldAngle;

			//console.log("rightBorder:", rightBorder);

			/*------RIGHT BORDER CONDITIONAL------*/

			if (rightBorder >= 0 && prevRightBorder < 0 && rightBorder - prevRightBorder < Math.PI) {
				if (rightBorder < 0.01 * gravityFieldAngle) {
					return E;
				}
				else {
					return this.searchForEnterPoint(prevE, E, satellite, addPeriods, 2, prevAngle);
				}
			}
		}

		return false;
	}

	getAngleDifference(E, satellite, addPeriods) {
		let position = (this.e.length < 1 ? this.getPositionFromE : this.getPositionFromH).call(this, E);

		let	spacecraftAngle = position.angle + this.e.angle,
			M = (this.e.length < 1 ? this.getMfromE : this.getMfromH).call(this, E),
			time = this.getTimeFromM(M) + Math.floor(addPeriods) * Math.min(Number.MAX_VALUE, this.period),
			satelliteAngle = satellite.getTrueAnomalyAtTime(time),
			angleDiff = spacecraftAngle - satelliteAngle;
			//console.log("getAngleDiff E:", E);
			//console.log("getAngleDiff M:", M);
			//console.log("getAngleDiff time:", time);

		return (angleDiff - Math.floor(angleDiff / (Math.PI*2) + 0.5) * Math.PI*2) % Math.PI;
	}


	/*------VELOCITY FROM R------*/

	getVfromR(r) {
		return Math.sqrt(this.universe.G*this.orbitedBody.mass * (2 / r - 1 / this.a));
	}


	/*------M, E, H, TIME AND POSITIONS CALCULATIONS------*/

	getTimeFromM(M) {
		return this.tp + M / this.n;
	}

	getMfromTime(time) {
		return M * this.n * (time - this.tp);
	}

	getMfromE(E) {
		return E - this.e.length * Math.sin(E);
	}

	getMfromH(H) {
		if (Math.abs(H) <= this.H690) {
			return this.e.length * Math.sinh(H) - H;
		}
		else {
			return (Math.sinh(H) - Math.sinh(this.H690)) / this.H690plusYfactor + Math.sign(H) * 690;
		}
	}

	getPositionFromE(E) {
		return new Vector(
			this.a * (Math.cos(E) - this.e.length),
			this.b * Math.sin(E) * this.direction
		);
	}

	getPositionFromH(H) {
		return new Vector(
			this.a * (Math.cosh(H) - this.e.length),
			this.b * Math.sinh(H) * this.direction
		);
	}

	getEfromPosition(position) {
		let E = Math.atan2(position.y / this.b * this.direction, position.x / this.a + this.e.length);
		return mod2(E, Math.PI*2);
	}

	getHfromPosition(position) {
		let sinhH = position.y / this.b * this.direction,
			H = Math.log(sinhH + Math.sqrt(sinhH*sinhH + 1));
		return H;
	}

	calculateE(M, E) {
		let dE,
			i = 0;
		while (true) {
			dE = M + this.e.length * Math.sin(E) - E;
			E += dE;
			i++;
			if (Math.abs(dE) < 1e-10 || i > 9999) {
				break;
			}
		}
		return E;
	}

	calculateH(M, H) {
		let dH,
			i = 0;
		while (true) {
			dH = (M - this.e.length * Math.sinh(H) + H) / (this.e.length * Math.cosh(H) - 1);
			H += dH;
			i++;
			if (Math.abs(dH) < 1e-10 || i > 9999) {
				break;
			}
		}
		return H;
	}
}

class Ellipse {
	constructor(a, e) {
		this.a = a;
		this.f = a*e;
		this.b = a*Math.sqrt(1 - e*e);
		this.e = e;
		this.asq = a*a;
		this.bsq = this.b*this.b;
	}

	getXfromC(c) {
		return this.a * (this.a - c) / this.f;
	}

	getYfromX(x) {
		return Math.sqrt(Math.max(0, this.bsq * (1 - x*x / this.asq)) );
	}

	getXfromY(y) {
		return Math.sqrt(this.asq * (1 - y*y / this.bsq) );
	}

	getPointFromSideAngle(angle) {
		let	atan = Math.atan(Math.tan(angle) * this.b / this.a),
			x = Math.cos(atan) * this.a,
			y = Math.sin(atan) * this.b;
		return {x: x, y: y};
	}

	getSideAngleFromPoint(point) {
		return Math.PI/2 - Math.atan2(point.x / this.asq, point.y / this.bsq);
		let ba = this.b / this.a,
			atan = Math.atan2(point.y / this.b, point.x / this.a),
			angle = Math.atan2(Math.sin(atan) / ba, Math.cos(atan));
		return mod2(angle, Math.PI*2);
	}
}

class Hyperbola {
	constructor(a, e) {
		this.a = a;
		this.f = a*e;
		this.b = -a*Math.sqrt(e*e - 1);
		this.e = e;
		this.asq = a*a;
		this.bsq = this.b*this.b;
		this.tan = - this.b / this.a;
		this.maxAngle = Math.atan(1 / this.tan);
	}

	getXfromC(c) {
		return this.a * (Math.abs(this.a) + c) / Math.abs(this.f);
	}

	getYfromX(x) {
		return Math.sqrt(this.bsq * (x*x / this.asq - 1) );
	}

	getXfromY(y) {
		return -Math.sqrt(this.asq * (1 + y*y / this.bsq) );
	}

	getPointFromSideAngle(angle) {
		let	tan = this.tan / Math.tan(Math.PI/2 - angle),
			atanh = 0.5 * Math.log((1 + tan) / (1 - tan)),
			x = Math.cosh(atanh) * this.a,
			y = Math.sinh(atanh) * this.b;
		return new Vector(x, y);
	}

	getSideAngleFromPoint(point) {
		return Math.PI/2 + Math.atan2(point.x / this.asq, point.y / this.bsq);
	}
}
