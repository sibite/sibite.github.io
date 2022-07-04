let Vector = function(x, y)	{
	Object.defineProperties(this, {
		length:	{
			get: function()	{
				return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
			},
			set: function(value)	{
				if (this.length != 0)	{
					let length = this.length;
					this.x *= value/length;
					this.y *= value/length;
				} else {
					this.x = this.y = 0;
				}
			}
		},
		angle: {
			get: function() {
				let angle = Math.atan2(this.y, this.x);
				return angle >= 0 ? angle : 2*Math.PI + angle;
			},
			set: function(value)	{
				let length = this.length
				this.x = Math.cos(value) * length;
				this.y = Math.sin(value) * length;
			}
		}
	});
	this.x = Number(x);
	this.y = Number(y);
}

Vector.fromAngle = function(angle, length = 1)	{
	let vector = new Vector(length, 0);
	vector.angle = angle;
	return vector;
}
Vector.prototype.add = function(vector) {
	this.x += vector.x;
	this.y += vector.y;
	return this;
}
Vector.prototype.subtract = function(vector) {
	this.x -= vector.x;
	this.y -= vector.y;
	return this;
}
Vector.prototype.sMultiply = function(vector) {
	this.x *= vector.x;
	this.y *= vector.y;
	return this;
}
Vector.prototype.square = function() {
	this.sMultiply(this);
	return this;
}
Vector.prototype.toLength = function(length) {
	let vector = this.copy();
	vector.length = length;
	return vector;
}
Vector.prototype.setLength = function(length) {
	this.length = length;
	return this;
}
Vector.prototype.toAngle = function(angle) {
	let vector = this.copy();
	vector.angle = angle;
	return vector;
}
Vector.prototype.toFactor = function() {
	let vector = this.copy();
	vector.length = 1;
	return vector;
}
Vector.prototype.copy = function() {
	return new Vector(this.x, this.y);
}
