class EventHandler {
	constructor(view) {
		this.view = view;
		this.universe = view.universe;
		this.pressedKeys = {
			KeyW: false,
			KeyS: false
		};
	}

	keyDown(event) {
		this.pressedKeys[event.code] = true;
	}

	keyUp(event) {
		this.pressedKeys[event.code] = false;

		if (event.code == "Minus") {
			universe.timeSpeed /= 2;
		}
		else if (event.code == "Equal") {
			universe.timeSpeed *= 2;
		}
	}

	wheel(event) {
		let scale = this.view.camera.scale;
		if (event.deltaY > 0) {
			let difference = scale.stopAnimation();
			scale.animate((scale.fixedValue + difference) / (6/5), BezierCurve.EASE_OUT_CUBIC, 500);
		}
		else {
			let difference = scale.stopAnimation();
			scale.animate((scale.fixedValue + difference) * (6/5), BezierCurve.EASE_OUT_CUBIC, 500);
		}
	}

	handleKeyboard() {
		if (this.pressedKeys.KeyQ) {
			this.universe.currentSpacecraft.rotation += 0.07;
		}
		else if (this.pressedKeys.KeyE) {
			this.universe.currentSpacecraft.rotation -= 0.07;
		}
		if (this.pressedKeys.KeyW) {
			let acceleration = Vector.fromAngle(this.universe.currentSpacecraft.rotation + Math.PI/2, 30);
			this.universe.currentSpacecraft.accelerate(this.universe.frameTime, acceleration);
		}
		else if (this.pressedKeys.KeyS) {
			let acceleration = Vector.fromAngle(this.universe.currentSpacecraft.rotation - Math.PI/2, 30);
			this.universe.currentSpacecraft.accelerate(this.universe.frameTime, acceleration);
		}
	}
}
