class AnimatedFloat {
	constructor(value, publisher, eventName = "nextFrame") {
		this.value = value;
		this.fixedValue = value;
		this.subscriptions = [];
		this.publisher = publisher;
		this.eventName = eventName;
	}

	setValue(value) {
		this.value = value;
		this.fixedValue = value;
	}

	animate(newValue, timingFunction = BezierCurve.LINEAR, time = 1000, delay = 0) {
		let toAdd = newValue - this.fixedValue,
			changedValue = 0,
			passedTime = 0;
		this.fixedValue = newValue;

		function nextFrame(event, subscription) {
			let previousChangedValue = changedValue;
			passedTime += event.deltaTime;
			changedValue = toAdd * timingFunction.getYofX(passedTime / time - delay);
			this.value += -previousChangedValue + changedValue;

			if (passedTime >= time) {
				subscription.unsubscribe();
				this.subscriptions.splice(this.subscriptions.indexOf(subscription), 1);
			}
		};

		this.subscriptions.push(this.publisher.subscribe(this.eventName, nextFrame.bind(this)));
	}

	stopAnimation() {
		this.subscriptions.forEach(subscription => {
			subscription.unsubscribe();
		});
		this.subscriptions = [];
		let difference = this.fixedValue - this.value;
		this.fixedValue = this.value;
		return difference;
	}

	customAnimate(initialValue, endingValue,
			valueFunction, timingFunction = Bezier.LINEAR,
			time = 1000, delay = 0
		) {
		let animatedValue = new AnimatedFloat(initialValue, this.publisher, this.eventName);
		this.fixedValue = valueFunction(endingValue);
		animatedValue.animate(endingValue, timingFunction, time, delay)
		let subscription = this.publisher.subscribe(this.eventName, function() {
			this.value = valueFunction(animatedValue.value);
			if (animatedValue >= endingValue) {
				subscription.unsubscribe();
			}
		}.bind(this));
		this.subscriptions.push(subscription);
	}
}
