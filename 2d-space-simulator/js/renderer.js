/*------BASIC RENDERER CLASS------*/

class Renderer {
	constructor(view) {
		this.view = view;
		this.universe = universe;
		this.camera = view.camera;
		this.canvas = view.canvas;
		this.ctx = view.canvas.ctx;
		this.bg = new Image();
		this.bg.src = "stars.jpg";

		this.generateCirclePoints(180);
	}

	generateCirclePoints(totalPoints) {
		this.circle = [];
		this.circle.dAngle = 1 / totalPoints * 2*Math.PI;
		for (let i = 0; i < totalPoints; i++) {
			let radians = i / totalPoints * 2*Math.PI;
			this.circle.push(Vector.fromAngle(radians));
		}
	}

	/*------POSITION RELATIVE TO ACTUAL SECTOR CENTER------*/
	getRelativePosition(object) {
		let relativeSector = object.getSector().subtract(this.camera.sector);
		relativeSector.length *= this.universe.SECTOR_SIZE*2;
		return relativeSector.add(object.getPosition());
	}

	getOnViewPosition(vector) {
		let cameraX = this.camera.position.x + this.camera.relativePosition.x,
			cameraY = -this.camera.position.y - this.camera.relativePosition.y
		let x = this.canvas.width / 2 +
				(vector.x - cameraX) * this.camera.scale.value,
			y = this.canvas.height / 2 +
				(-vector.y - cameraY) * this.camera.scale.value;
		return {x: x, y: y};
	}


	/*------DRAWING FUNCTIONS------*/

	drawCelestial(celestial) {
		let onViewPos = this.getOnViewPosition(this.getRelativePosition(celestial));

		this.ctx.save();

		/*------DRAWING GRAVITY FIELD------*/
		/*if (celestial.type != "Galaxy") {

			if (celestial.type != "Star") {
				let parentOnViewPos = this.getOnViewPosition(this.getRelativePosition(celestial.parent));

				this.ctx.save();
				this.ctx.translate(parentOnViewPos.x, parentOnViewPos.y);

				let innerField = new Path2D(),
					r1 = (celestial.orbitRadius - celestial.innerGravityField) * this.camera.scale.value,
					r2 = (celestial.orbitRadius + celestial.innerGravityField) * this.camera.scale.value,
					startAngle = (celestial.trueAnomaly - celestial.innerGravityField / celestial.orbitRadius),
					endAngle = (celestial.trueAnomaly + celestial.innerGravityField / celestial.orbitRadius);
				innerField.arc(0, 0, r1, -endAngle, -startAngle);
				innerField.arc(0, 0, r2, -startAngle, -endAngle, true);

				this.ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
				this.ctx.fill(innerField);

				this.ctx.restore();
			}

			this.ctx.save();
			this.ctx.translate(onViewPos.x, onViewPos.y);

			let outerField = new Path2D();
			outerField.arc(0, 0, celestial.outerGravityField * this.camera.scale.value, 0, Math.PI*2);
			this.ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
			this.ctx.fill(outerField);

			this.ctx.restore();
		}*/

		/*------DRAWING CIRCLE------*/
		this.ctx.translate(onViewPos.x, onViewPos.y);
		this.ctx.save();
		this.ctx.scale(this.camera.scale.value, this.camera.scale.value);

		let circle = new Path2D();
		circle.arc(0, 0, celestial.radius, 0, Math.PI*2);

		this.ctx.fillStyle = "rgb(255, 255, 255)";
		this.ctx.fill(circle);

		/*------DRAWING NAME------*/
		this.ctx.restore();
		this.ctx.font = "bold 12px sans-serif";
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.lineWidth = 3;
		this.ctx.lineJoin = "round";
		this.ctx.strokeStyle = "#000000";
		this.ctx.strokeText(celestial.name, 0, 0);
		this.ctx.fillText(celestial.name, 0, 0);

		this.ctx.restore();
	}

	drawCelestialOrbit(celestial) {
		if (celestial.orbitRadius) {
			let orbitCenter = this.getOnViewPosition(this.getRelativePosition(celestial.parent));
			let viewRadius = celestial.orbitRadius * this.view.camera.scale.value;
			let celestialViewRadius = celestial.radius * this.view.camera.scale.value;

			let ovState = {
				x: orbitCenter.x,
				y: orbitCenter.y,
				r: viewRadius
			};

			this.ctx.save();
			let formula1 = Math.max(0, 1 - (Math.log(ovState.r) - 11) * 2),
				formula2 = this.camera.lockedTo != celestial
						&& this.universe.currentSpacecraft.trajectory.getCurrentOrbit().orbitedBody != celestial
						? 1 : Math.max(0, 1 - (Math.log(celestialViewRadius) - 2.5) * 2);
			this.ctx.globalAlpha = Math.min(formula1, formula2);

			let orbitPath = new Path2D();

			if (ovState.r < 20000) {
				orbitPath.arc(ovState.x, ovState.y, ovState.r, 0, 2*Math.PI)
			}
			else if (this.ctx.globalAlpha > 0){
				let circlePointIndex = Math.floor(celestial.trueAnomaly / this.circle.dAngle) % this.circle.length;
				for (let i = 0; i <= circlePointIndex; i++) {
					orbitPath.lineTo(
						ovState.x + this.circle[i].x * ovState.r,
						ovState.y - this.circle[i].y * ovState.r
					);
				}
				orbitPath.lineTo(
					ovState.x + Math.cos(celestial.trueAnomaly) * ovState.r,
					ovState.y - Math.sin(celestial.trueAnomaly) * ovState.r
				);
				for (let i = circlePointIndex + 1; i < this.circle.length; i++) {
					orbitPath.lineTo(
						ovState.x + this.circle[i].x * ovState.r,
						ovState.y - this.circle[i].y * ovState.r
					);
				}
				orbitPath.closePath();
			}


			this.ctx.lineWidth = 1.7;
			this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
			this.ctx.stroke(orbitPath);

			this.ctx.restore();
		}
	}

	drawTrajectory(object) {
		if (object instanceof Spacecraft) {
			if (object.trajectory.orbits[0]) {
				let orbit = object.trajectory.orbits[0],
					path = new Path2D();

				if (orbit.e.length < 1) {
					orbit.absPoints.forEach(point => {
						let scrState = this.getOnViewPosition(point.copy().add(this.getRelativePosition(orbit.orbitedBody)));
						path.lineTo(scrState.x, scrState.y);
					});

					path.closePath();
				}
				else {
					orbit.absPoints.forEach(point => {
						let scrState = this.getOnViewPosition(point.copy().add(this.getRelativePosition(orbit.orbitedBody)));
						path.lineTo(scrState.x, scrState.y);
					});
				}
				this.ctx.strokeStyle = "rgba(50, 50, 255, 1)";
				this.ctx.lineWidth = 1.7;
				this.ctx.stroke(path);
			}
		}
	}

	drawSpacecraft(spacecraft) {
		let onViewPos = this.getOnViewPosition(this.getRelativePosition(spacecraft));

		this.ctx.save();
		this.ctx.translate(onViewPos.x, onViewPos.y);
		this.ctx.rotate(-spacecraft.rotation);

		/*------DRAWING ICON AND BASE------*/
		let triangle = new Path2D(),
			a = 20,
			h = a * Math.sqrt(3) / 2;
		triangle.lineTo(-a/2, h/2);
		triangle.lineTo(0, -h/2);
		triangle.lineTo(a/2, h/2);
		triangle.closePath();

		let base = new Path2D();
		base.lineTo(-a/2, h/2);
		base.lineTo(a/2, h/2);

		this.ctx.lineWidth = 2;
		this.ctx.fillStyle = "rgba(50, 50, 255, 0.4)";
		this.ctx.strokeStyle = "rgba(50, 50, 255, 1)";
		this.ctx.stroke(triangle);
		this.ctx.fill(triangle);

		this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
		this.ctx.stroke(base);

		this.ctx.restore();
	}
}





/*------UNIVERSER RENDERER CLASS------*/

class UniverseRenderer extends Renderer {
	constructor(view) {
		super(view);
	}

	render() {
		/*------DRAWING BACKGROUND------*/
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		/*------DRAWING CELESTIAL ORBITS-------*/
		Object.keys(this.universe.allCelestials).forEach(function(celestialUID) {
			this.drawCelestialOrbit(this.universe.allCelestials[celestialUID]);
		}.bind(this));

		/*------DRAWING TRAJECTORIES------*/
		this.universe.spacecrafts.forEach(function(spacecraft) {
			this.drawTrajectory(spacecraft);
		}.bind(this));

		/*------DRAWING GALAXIES------*/
		this.universe.galaxies.forEach(function(galaxy) {
			this.drawCelestial(galaxy)
		}.bind(this));

		/*------DRAWING CELESTIAL BODIES------*/
		Object.keys(this.universe.allCelestials).forEach(function(celestialUID) {
			this.drawCelestial(this.universe.allCelestials[celestialUID]);
		}.bind(this));

		/*------DRAWING SPACECRAFTS------*/
		this.universe.spacecrafts.forEach(function(spacecraft) {
			this.drawSpacecraft(spacecraft);
		}.bind(this));


		//temporary time speed
		this.ctx.textBaseline = "bottom";
		this.ctx.textAlign = "start";
		this.ctx.font = "bold 16px sans-serif";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 3;
		let text = "Czas x "+Intl.NumberFormat("pl", {
			useGrouping: true
		}).format(this.universe.timeSpeed);

		let width = this.canvas.width / this.camera.scale.value,
			widthText;
		if (width < 10000) {
			widthText = Intl.NumberFormat("pl", {
				useGrouping: true,
				maximumSignificantDigits: 3
			}).format(width)+" metrów"
		}
		else if (width < toMeters(0.1)) {
			widthText = Intl.NumberFormat("pl", {
				useGrouping: true,
				maximumFractionDigits: 0
			}).format(width/1000)+" kilometrów"
		}
		else if (width < toMeters(10)){
			widthText = Intl.NumberFormat("pl", {
				useGrouping: true,
				maximumFractionDigits: 2
			}).format(toLightYears(width))+" lat świetlnych"
		}
		else {
			widthText = Intl.NumberFormat("pl", {
				useGrouping: true,
				maximumFractionDigits: 0
			}).format(toLightYears(width))+" lat świetlnych"
		}
		let text2 = "Skala: "+widthText;
		this.ctx.strokeText(text, 10, this.canvas.height - 35);
		this.ctx.fillText(text, 10, this.canvas.height - 35);
		this.ctx.strokeText(text2, 10, this.canvas.height - 10);
		this.ctx.fillText(text2, 10, this.canvas.height - 10);
	}
}
