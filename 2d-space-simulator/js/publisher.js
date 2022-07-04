class Publisher {
	constructor() {
		this.subscribers = {};
	}
	subscribe(event, func) {
		if (!this.subscribers[event]) {
			this.subscribers[event] = Object.create(Object.prototype, {
				nextIndex: {
					value: 0,
					writable: true,
					enumerable: false
				}
			});
		}

		let subscribers = this.subscribers[event],
			index = subscribers.nextIndex++,
			subscription = {
				unsubscribe() {
					delete subscribers[index];
				}
			};

		subscribers[index] = function(eventData) {
			func(eventData, subscription);
		};

		return subscription;
	}
	publish(event, data) {
		if (this.subscribers[event]) {
			Object.keys(this.subscribers[event]).forEach(function(index) {
				this.subscribers[event][index](data);
			}.bind(this));
		}
	}
}
