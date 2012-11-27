boxman.model.history = function() {};

jQuery.extend(boxman.model.history.prototype, {
	
	_history: [],
	
	_cursor: -1,
	
	reset: function(data) {
		this._history.splice(0);
		this._cursor = -1;
		
		if (data) {
		    jQuery.extend(true, this._history, data);
		}
	},
	
	forwardAvailable: function() {
		return this._cursor < this._history.length -1;
	},
	
	backAvailable: function() {
		return this._cursor >= 0;
	},
	
	add: function(item) {
		var spliceFrom = this._cursor + 1;
		if (this._history.length - 1 > this._cursor) {
			this._history.splice(spliceFrom);
		}
		this._history.push(item);
		this._increaseCursor();
	},
	
	_decreaseCursor: function() {
		this._cursor--;
	},
	
	_increaseCursor: function() {
		this._cursor++;
	},
	
	data: function() {
	    return this._history;    
	},
	
	get: function(offset) { // 1: forward, -1: back
		var item = null;
		if (offset == 1 && this.forwardAvailable()) {
			item = this._history[this._cursor + 1]
		}
		if (offset == -1 && this.backAvailable()) {
			item = this._history[this._cursor]
		}
		
		if (item) {
    		if (offset == -1) {
    			this._decreaseCursor();
    		} else {
    			this._increaseCursor();
    		}
		}
		
		return item;
	},
	
	steps: function() {
		return this._cursor;
	}
});