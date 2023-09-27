boxman.controller.Player = function() {};

jQuery.extend(boxman.controller.Player.prototype, {
    
    _painter: null,
	
	_hPlaybackInterval: 0,
	
	_flagPlayback: 'stop',
	
	_playbackOffset: 0,
	
	_walkInterval: 100,
	
	init: function(painter) {
	    this._painter = painter;    
	    
		PubSub.subscribe('evt_on_play', this, this._onPlay);
		PubSub.subscribe('evt_on_pause', this, this._onPause);
		PubSub.subscribe('evt_on_stop', this, this._onStop);
	},

	reset: function() {
	    clearInterval(this._hPlaybackInterval);
	    this._hPlaybackInterval = 0;
	    this._flagPlayback = 'stop';
	    this._playbackOffset = 0;
	},	

	
	_onPause: function() {
        this._flagPlayback = 'pause';    
	},

	
	_onStop: function() {
		this.reset();
		
		boxman.Runtime.map.restore();
		this._painter.drawMap();
	},
	
	_onPlay: function() {
	    this.playback();    
	},
	
	playback: function() {
	    var self = this;
	    this._flagPlayback = 'play';
	    
	    if (this._hPlaybackInterval > 0) {
	        return;
	    }
	    
	    this._playbackOffset = 0;
	    var data = boxman.Runtime.history.data();
		
		this._hPlaybackInterval = setInterval(function() {
		    if (self._flagPlayback != 'play') {
		        return;
		    }
		    
			if (self._playbackOffset == data.length) {
				clearInterval(self._hPlaybackInterval);
				return;
			}
			
			var grids = data[self._playbackOffset];
			boxman.Runtime.map.slideGridsLayer2(grids);
			self._painter.drawGrids(grids);

			self._playbackOffset++;
		}, self._walkInterval);	
	}
});