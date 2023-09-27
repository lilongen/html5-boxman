/**
 * lilong'en(lilongen@gmail.com)
 *
 * Graph shortest path: A star algorithm
 *
 */

boxman.util.AstarPath = {
	
	_MAX: Math.pow(2, 53),
	
	_map: null,
	
	_openList: new boxman.util.SortedDlink(),
	
	_closedList: {},
	
	_barrierList: {},
	
	_nodesInfo: {},
	
	_triggerAlgorithmEvent: false,
	
	_dest: {
	    x: -1,
	    y: -1,
	    idx: -1 
	},
	
	_src: {
	    x: -1,
	    y: -1,
	    idx: -1 	    
	},
	
    _DirectionOffsets: [
        {x: 0, y: -1},//up
        {x: 1, y: 0},//right
        {x: 0, y: 1},//bottom
        {x: -1, y: 0}//left
    ],
    
    setTriggerAlgorithmEvent: function(bTrigger) {
       this._triggerAlgorithmEvent = bTrigger;
    },
	
	setMap: function(map) {
		this._map = map;
		var self = this;
		
		(function initBarrierListAndMapNodes() {
		    self._resetBarrierList();
            self._reset();
		    
    		var cnt = map.cols * map.rows;
    		for (var i = 0; i < cnt; i++) {
                var coord = map.index2Coord(i);
                var strI = i + '';
                if (map.isBarrier(coord.x, coord.y)) {
                    self._barrierList[strI] = 1;
                } else {
                    self._nodesInfo[strI] = self._defaultNode({}, coord.x, coord.y, i);
                }
    		}
		}());
	},
	
	_defaultNode: function(node, x, y, i) {
        if (arguments.length == 4) {
            node.x = x;
            node.y = y;
            node.idx = i;
        }
        
        node.parentIdx = -1;
        node.F = this._MAX;
        node.G = this._MAX;
        node.H = this._MAX;
        
        return node;
	},
	
	_setSrcNode: function(srcIdx) {
	    var node = this._nodesInfo[srcIdx];
	    node.F = 0;
	    node.G = 0;
	    node.H = 0;
	    node.parentIdx = -1;
	},
	
	_H: function(x, y) {
	    return Math.abs(this._dest.x - x) + Math.abs(this._dest.y - y);
	},
	
	_constructHumanPath: function() {
		var map = this._map
		var pathCoords = [];
		var idx = this._dest.idx;
		while (idx != this._src.idx) {
            var node = this._nodesInfo[idx + ''];
            pathCoords.push({x: node.x, y: node.y});
            idx = node.parentIdx;           
		}
		
		pathCoords.push({x: this._src.x, y: this._src.y});
		
		return pathCoords.reverse();
	},
	
	_storePointInfo: function(obj, x, y) {
	    obj.x = x;
	    obj.y = y;
	    obj.idx = this._map.coord2Index(x, y);
	},
	
	_inClosed: function(strIdx) {
	    return this._barrierList[strIdx] || this._closedList[strIdx];
	},
	
	_reset: function() {
	    this._resetClosedList();
	    this._resetOpenList();
	    this._resetNodesInfo();
	},
	
	_resetBarrierList: function() {
	    for (var strIdx in this._barrierList) {
		    delete this._barrierList[strIdx];
		}
	},	
	
	_resetClosedList: function() {
        for (var strIdx in this._closedList) {
            this._closedList[strIdx] = 0;
        }		    
	},
	
	_resetOpenList: function() {
	    this._openList.clear();
	},
	
	_resetNodesInfo: function() {
        for (var strIdx in this._nodesInfo) {
            this._defaultNode(this._nodesInfo[strIdx]);
        }	    
	},
	
	_storeSrcDestInfo: function(fromX, fromY, toX, toY) {
        this._storePointInfo(this._src, fromX, fromY);
        this._storePointInfo(this._dest, toX, toY);	    
	},

	path: function(fromX, fromY, toX, toY) {
	    this._reset();
	    this._storeSrcDestInfo(fromX, fromY, toX, toY);
		
		var map = this._map;
		var originIdx = this._src.idx;
		var toIdx = this._dest.idx;
        this._addNode2OpenList(originIdx, 0);	
        this._setSrcNode(originIdx);
        
        var pathFound = false;
        var coords = [];
		while (this._openList.length()) {
		    var openListItem = this._openList.popup();
			var openingNode = this._nodesInfo[openListItem.nodeIdx];

			for (var i = 0; i < this._DirectionOffsets.length; i++) {
			    var offset = this._DirectionOffsets[i];
			    var x = openingNode.x + offset.x;
			    var y = openingNode.y + offset.y;
			    
			    if (x < 0 || x >= map.cols || y < 0 || y >= map.rows) {
			        continue;    
			    }
			    
		        var idx = map.coord2Index(x, y);
		        var strIdx = idx + '';
		        if (map.isBox(x, y)) {
		            this._addNode2ClosedList(strIdx);
		            continue;
		        }
		        if (this._inClosed(strIdx)) {
		            continue;
		        }		        
                
                coords.push([x, y]);
                var h = this._H(x, y);
                var g = openingNode.G + 1;
                var f = h + g;
                var optNode = this._nodesInfo[strIdx];
                
		        if (this._openList.contain(strIdx)) {
                    if (optNode.G > g) {
    		            this._updateNode(optNode, openingNode.idx, g);	   
                    }
		        } else {
                    this._setNode(optNode, openingNode.idx, f, g, h);	
		            this._addNode2OpenList(idx, f);		            
		        }
			}
			
			this._addNode2ClosedList(openingNode.idx);
			
			if (this._inClosed(toIdx + '')) {
			    pathFound = true;
			    break;
			}			
		}
		
		if (pathFound) {
		    return this._constructHumanPath();
		} else {
		    return null;
		}
	},
	
	_addNode2OpenList: function(idx, f) {
	    this._openList.add(idx, f);
        if (this._triggerAlgorithmEvent) {
            PubSub.publish('evt_pathai_astar_added_to_openlist', idx);	      
        }
	},
	
	_addNode2ClosedList: function(idx) {
	    if (typeof idx == 'number') {
	        idx += '';
	    }
	    this._closedList[idx] = 1;
        
        if (this._triggerAlgorithmEvent) {
            PubSub.publish('evt_pathai_astar_added_to_closedlist', idx);	      
        }
	},	
	
	_setNode: function(node, parentIdx, f, g, h) {
        node.parentIdx = parentIdx;
        node.G = g;
        node.F = f;
        node.H = h;	    
	},
	
	_updateNode: function(node, parentIdx, g) {
        node.parentIdx = parentIdx;
        node.G = g;
        node.F = node.H + node.G;
	}
};
