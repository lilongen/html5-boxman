/**
 * lilong'en(lilongen@gmail.com)
 * 
 * Graph shortest path: Dijkstra algorithm
 *
 */

boxman.util.DijkstraPath = {
	
	_MAX: Math.pow(2, 53),
	
	_map: null,
	
	_done: {},
	
	_nodes: [],
	
	_triggerAlgorithmEvent: false,
	
    setTriggerAlgorithmEvent: function(bTrigger) {
       this._triggerAlgorithmEvent = bTrigger;
    },	
	
	setMap: function(map) {
		this._map = map;
		
		if (this._nodes.length > 0) {
			this._nodes.splice(0);
		}
	},
	
	_reset: function() {
		var map = this._map;
		var cnt = map.cols * map.rows;
		var manCoord = map.getManCoord();
		var manIdx = map.coord2Index(manCoord.x, manCoord.y);
		
		var coord;
		var right = 1;
		var rights = this._MAX;
		for (var i = 0; i < cnt; i++) {
			coord = map.index2Coord(i);
			var strI = '' + i;
			if (!this._nodes[i]) {
				this._nodes[i] = {};
			}

			if (map.isBarrier(coord.x, coord.y) || map.isBox(coord.x, coord.y)) {
				this._nodes[i].rights = this._MAX;
				this._nodes[i].right = this._MAX;
				this._nodes[i].last = -1;				
				continue;
			}
			if (manIdx == i) {
				this._nodes[i].rights = 0;
				this._nodes[i].right = 1;
				this._nodes[i].last = -1;
				this._doneNode(strI, 1);
				continue;
			}
			
			this._nodes[i].rights = this._MAX;
			this._nodes[i].right = 1;
			this._nodes[i].last = -1;
			this._doneNode(strI, 0);
		}		
	},
	
	_doneNode: function(strI, val) {
	    this._done[strI] = val;
	    if (this._triggerAlgorithmEvent && val) {
			PubSub.publish('evt_pathai_dijkstra_added_to_donelist', parseInt(strI));	        
	    }
	},
	
	_constructHumanPath: function(originIdx, toIdx) {
		var map = this._map
		var idx = toIdx;
		var pathCoords = [];
		pathCoords.push(map.index2Coord(toIdx));
		while (true) {
			pathCoords.push(map.index2Coord(this._nodes[idx].last));
			idx = this._nodes[idx].last;
			if (idx == originIdx) {
				break;
			}
		}
		
		return pathCoords.reverse();
	},
	
	_walkable: function(idx) {
		return this._nodes[idx].right == 1;
	},
	
	path: function(fromX, fromY, toX, toY) {
		this._reset();
	
		var done = false;
		var map = this._map;
		var originIdx = map.coord2Index(fromX, fromY);
		var toIdx = map.coord2Index(toX, toY);
		var operatingPoints = [];
		
		operatingPoints[0] = [originIdx];
		for (var step = 0; step < this._MAX; step++) {
			var next = step + 1;
			operatingPoints[next] = [];
			var runNext = false;
			
			for (var j = 0; j < operatingPoints[step].length; j++) {
				var operatingIdx = operatingPoints[step][j];
				var operatingCoord = map.index2Coord(operatingIdx);
				var arounds = map.getArounds(operatingCoord.x, operatingCoord.y);

				for (var i = 0; i < arounds.length; i++) {
					var x = arounds[i].x;
					var y = arounds[i].y;
					var idx = map.coord2Index(x, y);
					var strIdx = '' + idx;
					
					if (!this._walkable(idx)) {
						continue;
					}
					
					if (this._done[strIdx]) {
						continue;
					}
					
					if (this._nodes[operatingIdx].rights + this._nodes[idx].right < this._nodes[idx].rights) {
						this._nodes[idx].rights = this._nodes[operatingIdx].rights + this._nodes[idx].right;
						this._nodes[idx].last = operatingIdx;
						operatingPoints[next].push(idx);
						if (idx == toIdx) {
							this._doneNode(strIdx, 1);
							return this._constructHumanPath(originIdx, toIdx);
						} else {
							this._doneNode(strIdx, 1);
							runNext = true;	
						}
					}					
				}				
			}
			
			if (!runNext) {
				break;
			}
		}
		
		return null;		
	}
};
