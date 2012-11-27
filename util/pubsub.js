/**
 * a simple object to implement event pub/sub mechanism
 * support: 
 *   publish, subscribe, unsubscribe
 *
 * by: lilong'en (lilongen@gmail.com)
 *
 */
PubSub = {

	_topics: {},
	
	_uuid: 10000,
	
	publish: function() {
		var topic = arguments[0];
		if (!this._topics.hasOwnProperty(topic)) {
			return;
		}
		
		var argus = [];
		for (var i = 1; i < arguments.length; i++) {
			argus.push(arguments[i]);
		}
		
		this._dispatch(topic, argus);
	},
	
	_dispatch: function(topic, argus) {
		var subscribers = this._topics[topic];
		for (var i = 0; i < subscribers.length; i++) {
			subscribers[i].callback.apply(subscribers[i].context, argus);
		}		
	},

	subscribe: function (topic, context, callback) {
		if (!this._topics.hasOwnProperty(topic)) {
			this._topics[topic] = [];
		}
		
		var uuid = this._uuid++;
		this._topics[topic].push({
			uuid: uuid,
			context: context,
			callback: callback
		});
		
		return topic + '|' + uuid;
	},
	
	unsubscribe: function (token) {
		var tokenArray = token.split('|');
		var topic = tokenArray[0];
		var uuid = tokenArray[1];
		if (!this._topics[topic]) {
			return false;
		}
		
		for (var i = 0; i < this._topics[topic].length; i++) {
			if (this._topics[topic][i].uuid == uuid) {
				this._topics[topic].splice(i, 1);
				return true;
			}
		}
		
		return false;
	}
};