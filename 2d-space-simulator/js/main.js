let universe = new Universe(),
	view = new View(universe);

let sun = universe.allCelestials["389218379"],
	earth = universe.allCelestials["847395385"],
	moon = universe.allCelestials["573957245"],
	jupiter = universe.allCelestials["913775422"];

let speed1 = Math.sqrt(universe.G * earth.mass / (earth.radius + 2000 * 1000));
//let speed2 = Math.sqrt(universe.G * earth.mass / (6371000 + 4000000))
let rocket1 = new Spacecraft(
	universe,
	"038947285",
	{
		sector: earth.getSector(),
		position: Vector.fromAngle(3.5, earth.radius + 2000 * 1000),
		velocity: Vector.fromAngle(3.5 + Math.PI/2, speed1)
	}
);
let rocket2 = new Spacecraft(
	universe,
	"038947285",
	{
		sector: earth.getSector(),
		position: Vector.fromAngle(toRadians(0), earth.radius + 2000 * 1000),
		velocity: Vector.fromAngle(toRadians(90), 9100)
	}
);

/*for (let i = 0; i < 2000; i++) {
	let angle = randomFloat(0, 360),
		r = 6371000 + randomFloat(1000000, 50000000);
	let rocket = new Spacecraft(
		universe,
		"038947285",
		{
			sector: earth.star.sector,
			position: Vector.fromAngle(toRadians(angle), r),
			velocity: Vector.fromAngle(toRadians(angle + randomFloat(0, 180)), randomFloat(2000, 8000))
		}
	);
	universe.putSpacecraft(rocket, earth);
	if (rocket.trajectory.orbit.type == "hyperbolic" || rocket.trajectory.orbit.a-rocket.trajectory.orbit.f < earth.radius) {
		universe.removeSpacecraft(rocket);
	}
}*/

universe.putSpacecraft(rocket1, earth);
//universe.putSpacecraft(rocket2, earth);
universe.currentSpacecraft = rocket1;
view.lockCamera(rocket1);
view.camera.scale.setValue(view.canvas.minSize / 50000000);
universe.timeSpeed = 1;
universe.resume();



document.body.addEventListener("keypress", function(event) {
	if (event.code == "KeyR") {
		universe.timeSpeed *= -1;
	}
});
