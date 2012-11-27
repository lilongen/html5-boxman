boxman.controller.PathAiDemoer = function() {};

jQuery.extend(boxman.controller.PathAiDemoer.prototype, {
	
	_aiExecutor: null,
	
	_ctx: null,
	
	_DemoStepInterval: 200,
	
	_astarNodes: [],
	
	_dijkstraDoneNodes: [],
	
	_path: [],
	 
	_DemoStyles: {
		Astar:	{
			OpenNode: '#fff',
			ClosedNode: '#FF8C00' 
		},
		
		Dijkstra: {
			DoneNode: '#ffffff'
		},
		
		PathNode: {
			'dest': 'rgba(0,200,0,1)',
			'normal': 'rgba(0,160,0,0.6)',
			'src': 'rgba(200,0,0,1)',
			'walk': 'rgba(255,255,255,0.6)'
		}
	},
	
	_dest: {
	    x: -1,
	    y: -1    
	},
	
	_src: {
	    x: -1,
	    y: -1    
	},		
	
	init: function(aiExecutor, ctx) {
		this._aiExecutor = aiExecutor;
		this._ctx = ctx;
		
		PubSub.subscribe('evt_pathai_astar_added_to_openlist', this, this._onNodeAdded2Openlist);
		PubSub.subscribe('evt_pathai_astar_added_to_closedlist', this, this._onNodeAdded2Closedlist);
		PubSub.subscribe('evt_pathai_dijkstra_added_to_donelist', this, this._onNodeIsDone);
		PubSub.subscribe('evt_on_walk_grids', this, this._onWalkGrids);
		
		this._ctx.font = '11px Arial';
		this._ctx.textBaseline = 'middle';
		this._ctx.strokeStyle = '#000';
	},
	
	setAiExecutor: function(aiExecutor) {
		this._aiExecutor = aiExecutor;
	},
	
	_onNodeAdded2Openlist: function(idx) {
	    this._astarNodes.push([0, idx]);
	},
	
	_onNodeAdded2Closedlist: function(idx) {
	    this._astarNodes.push([1, idx]);
	},
	
	_onNodeIsDone: function(idx) {
	    this._dijkstraDoneNodes.push(idx);
	},
	
	_onWalkGrids: function(grids) {
		for (var i = 0; i < grids.length; i++) {
			this._markPathNode(grids[i].x, grids[i].y, this._DemoStyles.PathNode.walk);
		}
	},
	
	demo: function(src, dest, path) {
	    this._src.x = src.x;
	    this._src.y = src.y;
	    this._dest.x = dest.x;
	    this._dest.y = dest.y;
	    	    	    
        jQuery.extend(true, this._path, path);    
	       
		if (this._aiExecutor == boxman.util.DijkstraPath) {
			this._demoDijkstra();	
		} else {
			this._demoAstar();
		}
	},

	_markDestNode: function() {
        this._markPathNode(this._dest.x, this._dest.y, this._DemoStyles.PathNode.dest); 
	},
	
	_resetDemoData: function() {
		this._path.splice(0);
		this._astarNodes.splice(0);
		this._dijkstraDoneNodes.splice(0);
	},
	
	_demoAstar: function() {
	    var self = this;

	    this._markDestNode();
	    
	    var nodesCnt = this._astarNodes.length;
        var color = [this._DemoStyles.Astar.OpenNode, this._DemoStyles.Astar.ClosedNode];        
        var i = 0;
	    var hInterval = setInterval(function() {
	        var type = self._astarNodes[i][0];//0: added to openlist, 1: added to closed list
	        var idx = self._astarNodes[i][1];
            var coord = boxman.Runtime.map.index2Coord(idx);
	        self._markAlgorithmNode(i, coord.x, coord.y, color[type]);
	        
	        i++;
	        if (i >= nodesCnt) {
	            clearInterval(hInterval);
	            self._markPath();
	        }
	    }, this._DemoStepInterval);	    
	},
	
	_getDoneNodeColor: function(i, cnt) {
		var base = this._DemoStyles.Dijkstra.DoneNode;
		var c = parseInt(base.substr(1, 2), 16);
		var cMin = parseInt(33, 16);
		var cScope = c - cMin;
		c = Math.floor(++i / cnt * cScope + cMin).toString(16);
		if (c.length == 1) {
			c = '0' + c;
		}

		return '#%c%c%c'.replace(/%c/g, c);
	},
	
	_demoDijkstra: function() {
	    var self = this;
	    
	    this._markDestNode();
	    
	    var doneNodesCnt = this._dijkstraDoneNodes.length;
        var i = 0;
	    var hInterval = setInterval(function() {
	    	var idx = self._dijkstraDoneNodes[i];
            var coord = boxman.Runtime.map.index2Coord(idx);
	        self._markAlgorithmNode(i, coord.x, coord.y, self._getDoneNodeColor(i, doneNodesCnt));
	        
	        i++;
	        if (i >= doneNodesCnt) {
	            clearInterval(hInterval);
	            self._markPath();
	        }
	    }, this._DemoStepInterval);
	},
	
	_markAlgorithmNode: function(i, x, y, color) {
	    var rect = boxman.assistor.getLogicCoordRect(x, y);
	    rect = boxman.assistor.enlargeRect(rect, -4);
	    this._ctx.fillStyle = color;
	    this._ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
	    
	    //var center = boxman.assistor.getLogicCoordCenter(x, y);
	    //this._ctx.strokeText(i + '', center.x, center.y);
	},
	
        
    _getPathNodeMarkColor: function(i, cnt) {
    	if (i == 0) {
    		return this._DemoStyles.PathNode.dest;
    	} else if (i == cnt - 1) {
    		return this._DemoStyles.PathNode.src;
    	} else {
    		return this._DemoStyles.PathNode.normal;
    	}
    },
	
	_markPath: function() {
	    if (!this._path.length) {
	    	this._resetDemoData();
	        PubSub.publish('evt_on_pathai_demo_finished');
	        return;
	    }
	    
	    var self = this;
	    var cnt = this._path.length;
        var i = 0;
	    var hInterval = setInterval(function() {
	    	var coord = self._path[i];
	        self._markPathNode(coord.x, coord.y, self._getPathNodeMarkColor(i, cnt));
	        
	        i++;
	        if (i >= cnt) {
	            clearInterval(hInterval);
	            self._resetDemoData();
	            PubSub.publish('evt_on_pathai_demo_finished');
	        }
	    }, this._DemoStepInterval);		
	},
	
	_markPathNode: function(x, y, color) {
	    var coordCenter = boxman.assistor.getLogicCoordCenter(x, y);
	    this._ctx.fillStyle = color;
	    this._ctx.beginPath();  
	    this._ctx.arc(coordCenter.x, coordCenter.y, 10, 0, Math.PI * 2);
	    this._ctx.fill();
	}
});