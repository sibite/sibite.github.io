/*------VARIABLES EXISTENCE CONTROL*/

function placeholder(variable, placeholder) {
	return variable !== undefined ? variable : placeholder;
}
let ph = placeholder;

function isset(variable) {
	return variable !== undefined;
}

function getProperties(object, properties) {
	let returned = {};
	properties.forEach(property => {
		if (!isset(object[property])) {
			throw new Error("Data property '"+property+"' is undefined");
		}
		returned[property] = object[property];
	});
	return returned;
}


/*------UNIVERSE TYPICAL UTILITIES------*/

function toLightYears(meters) {
	return meters / 9460800000000000;
}

function toMeters(lightYears) {
	return lightYears * 9460800000000000;
}


/*------ANGLES------*/

function toRadians(degrees) {
	return degrees * Math.PI / 180;
}

function toDegrees(radians) {
	return radians * 180 / Math.PI;
}


/*------MATH------*/

function randomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function randomFloat(min, max) {
	return min + Math.random() * (max - min);
}

function mod2(a, b) {
	return ((a % b) + b) % b;
}

function between(a, b, c) {
	return Math.min(c, Math.max(b, a));
}


/*------ARRAYS------*/

Array.prototype.delete = function(element) {
	let index = this.indexOf(element);
	if (index != -1) {
		this.splice(index, 1);
	}
}
