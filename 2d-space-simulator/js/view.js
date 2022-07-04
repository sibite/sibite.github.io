class View {
	constructor(universe, views) {
		/*------CREATING RELATIONS------*/
		this.universe = universe;
		this.universe.view = this;
		this.views = views;

		/*------SETTING UP CAMERA------*/
		this.camera = {
			lockedTo: null,
			positionSystem: "outsideSector",
			sector: new Vector(0, 0),
			relativePosition: new Vector(0, 0),
			scale: new AnimatedFloat(0.00002, this.universe.publisher, "realNextFrame")
		};

		/*------CREATING CANVAS------*/
		this.canvas = {};
		this.canvas.element = document.createElement("canvas");
		this.canvas.element.classList.add("game-canvas");
		this.canvas.ctx = this.canvas.element.getContext("2d");
		document.body.innerHTML = "";
		document.body.appendChild(this.canvas.element);

		this.resize();

		/*------CREATING SUB CLASSES------*/
		this.universeRenderer = new UniverseRenderer(this);
		this.eventHandler = new EventHandler(this);

		/*------ADDING EVENT LISTENERS------*/

		this.eventQueue = [];

		/*------RESIZE------*/
		window.addEventListener("resize", function() {this.resize();}.bind(this));

		/*------KEYBOARD------*/
		document.body.addEventListener("keydown", function(event) {
			this.queueEvent(function() {
				this.eventHandler.keyDown(event);
			}.bind(this));
		}.bind(this));

		document.body.addEventListener("keyup", function(event) {
			this.queueEvent(function() {
				this.eventHandler.keyUp(event);
			}.bind(this));
		}.bind(this));

		/*------SCROLL------*/
		document.body.addEventListener("wheel", function(event) {
			this.queueEvent(function() {
				this.eventHandler.wheel(event);
			}.bind(this));
		}.bind(this));
	}

	resize(width, height) {
		width = ph(width, window.innerWidth);
		height = ph(height, window.innerHeight);
		this.canvas.ratio = window.devicePixelRatio;
		this.canvas.width = this.canvas.element.width = width * this.canvas.ratio;
		this.canvas.height = this.canvas.element.height = height * this.canvas.ratio;
		this.canvas.element.style.width = (this.canvas.styleWidth = width) + "px";
		this.canvas.element.style.height = (this.canvas.styleHeight = height) + "px";
		this.canvas.minSize = Math.min(this.canvas.width, this.canvas.height);
		this.canvas.maxSize = Math.max(this.canvas.width, this.canvas.height);
	}

	queueEvent(callback) {
		this.eventQueue.push(callback);
	}

	/*------CAMERA------*/

	lockCamera(object) {
		this.camera.lockedTo = object;
	}

	/*------RENDERING------*/

	render() {
		let lockedTo = this.camera.lockedTo;

		if (lockedTo) {
			this.camera.position = lockedTo.getPosition();
			this.camera.sector = lockedTo.getSector();
			this.camera.relativePosition.x = 0;//-28000000;
			this.camera.relativePosition.y = 0;
		}

		this.universeRenderer.render();

		/*------SETTING NEXT FRAME------*/
		window.requestAnimationFrame(function() {this.universe.nextFrame()}.bind(this));
	}
}
