class SpacecraftModule {
	constructor(blueprint) {
		this.uid = ph(blueprint.uid, "unknown-"+Math.floor(Math.random()*1000000000));
		this.name = ph(blueprint.name, this.uid);
		this.hitboxes = ph(blueprint.hitboxes, {x: -1, y: 1, width: 2, height: 2});
		this.image = blueprint.image;
		let placeholder = new Image();
		placeholder.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAA
		QCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA
		7DAcdvqGQAAABLSURBVDhP3Y+xEcBADINcZP8xs8an4VSg9wLh6ESj2Xifc5W5UReZG3WRu
		VEXmRt1kblRF5kbdZG5URf/fW5DXWRu1EXmRl1kFjMfcHr0gYUbHK8AAAAASUVORK5CYII=`;
		this.image.element = placeholder;
		this.engines = blueprint.engines;
	}

	clone() {
		return new this.constructor(this);
	}

	setImage(image) {
		this.image.element = image;
	}
}

class Spacecraft {
	constructor(universe, blueprintUID, state) {
		this.universe = universe;
		this.blueprint = universe.blueprints.spacecrafts[blueprintUID];
		this.modules = [];
		this.blueprint.modules.forEach(function(moduleInfo) {
			let uid = moduleInfo.uid,
				spacecraftModuleObject = new SpacecraftModule(universe.blueprints.spacecraftModules[uid]),
				spacecraftModule = {
					x: moduleInfo.x,
					y: moduleInfo.y,
					object: spacecraftModuleObject
				};
			this.modules.push(spacecraftModule);
		}.bind(this));

		this.rotation = 0;
		this.trajectory = new Trajectory(universe, this);
		this.name = this.blueprint.uid;
		state = ph(state, {});
		this.sector = ph(state.sector, new Vector(0, 0));
		this.position = ph(state.position, new Vector(0, 0));
		this.velocity = ph(state.velocity, new Vector(0, 0));
		this.velocityChanged = false;
	}

	getPosition() {
		if (this.trajectory) {
			return this.trajectory.getCurrentOrbit().orbitedBody.getPosition().add(this.position);
		} else {
			return this.position;
		}
	}

	getSector() {
		return this.trajectory.getCurrentOrbit().orbitedBody.getSector();
	}

	accelerate(deltaTime, acceleration) {
		if (this.trajectory) {
			acceleration.length *= deltaTime;
			this.velocity.add(acceleration);
			this.calculateTrajectory(this.trajectory.getCurrentOrbit().orbitedBody, this.universe.time - deltaTime);
		}
	}

	calculateTrajectory(orbitedBody, time) {
		this.trajectory.calculate(this.position.copy(), this.velocity.copy(), orbitedBody, time);
	}

	updatePosition(time, deltaTime) {
		let state = this.trajectory.getState(time, deltaTime);
		this.trajectory.refreshOrbitChange();
		this.velocity = state.velocity;
		this.position = state.position;
	}

	center() {
		let bottom = Infinity,
			top = -Infinity;

		this.modules.forEach(rocketModule => {
			rocketModule.object.hitboxes.forEach(hitbox => {
				let currentTop = rocketModule.y + hitbox.y,
					currentBottom = currentTop - hitbox.height;
				if (currentTop > top) {
					top = currentTop;
				}
				if (currentBottom < bottom) {
					bottom = currentBottom;
				}
			});
		});

		let height = top - bottom,
			yDifference = height / 2;

		this.modules.forEach(rocketModule => {
			rocketModule.y -= yDifference;
		})

		let positionChange = new Vector(0, yDifference);
		positionChange.angle += this.rotation;
		this.position.add(positionChange);
		if (this.trajectory.celestial) {
			this.calculateOrbit();
		}
	}
}
