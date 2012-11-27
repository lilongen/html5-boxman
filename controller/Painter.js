/**
 * opts
 *    context: canvas context 
 *    transformable: if painter auto tranform to adapt to canvas size, scale and translate
 *    interactable: interactable, evente response-able
 */
boxman.controller.Painter = function(opts) {

	this._context = opts.context;
	
	this._transformable = opts.transformable;
	
	this._interactable = opts.interactable;
	
	this._canvasRect = {
		width: opts.canvas.width,
		height: opts.canvas.height
	};
	
	this._translateCoord = {
		x: 0,
		y: 0
	};
	
	this._scaleRatio = 1;

	this._brushes = {};
		
	this._brush = null;
	
	this._map = null;
	
	this._brushName = '';
	
	this._lastFocusGrid = {
		x: -1, 
		y: -1
	};
};

jQuery.extend(boxman.controller.Painter.prototype, {
	
	reset: function() {
		this._brush = null;
		this._brushName = '';
		this._map = null;
		this.setLastFocusGrid(-1, -1);
		this.clear();
	},
	
	setMap: function(map) {
		this._map = map;
		
		if (this._transformable) {
			this._context.save();
			this._transform();	
		}
	},

	_transform: function() {
		var mapNaturalRect = this.getMapNaturalRect();
		var widthRatio = (this._canvasRect.width / mapNaturalRect.width).toFixed(2);
		var heightRatio =  (this._canvasRect.height / mapNaturalRect.height).toFixed(2);

		var ratio = 1;
		if (widthRatio >= 1 && heightRatio >= 1) {
			;
		} else {
			ratio = Math.min(widthRatio, heightRatio);
			this._context.scale(ratio, ratio);
		}
		
		var offset = {
			left: Math.floor((this._canvasRect.width - mapNaturalRect.width * ratio) / 2),
			top: Math.floor((this._canvasRect.height - mapNaturalRect.height * ratio) / 2)
		};
		this._context.translate(offset.left, offset.top);
		
		this._scaleRatio = ratio;
		this._translateCoord.x = offset.left;
		this._translateCoord.y = offset.top;
	},
	
	getTranslateCoord: function() {
		return this._translateCoord;
	},
	
	
	getScaleRatio: function() {
		return this._scaleRatio;
	},
	
	setCanvasRect: function(size) {
		jQuery.extend(this._canvasRect, size);
	},

	setLastFocusGrid: function(x, y) {
		this._lastFocusGrid.x = x;
		this._lastFocusGrid.y = y;
	},	  
	
	init: function() {
	    this._initBrushes();
	    
	    if (this._interactable) {
	    	this._subscribeEvents();	
	    }
	},
	
	_subscribeEvents: function() {
		PubSub.subscribe('evt_on_select_brush', this, this._onSelectBrush);
		PubSub.subscribe('evt_on_focus_grid', this, this._onFocusGrid);
		PubSub.subscribe('evt_on_edit_grid', this, this._onEditGrid);
		PubSub.subscribe('evt_on_erase_grid', this, this._onEraseGrid);	
	},
	
	_initBrushes: function() {
		for (var key in boxman.Definition.Map.Image) {
			var img = new Image();
			img.src = 'themes/default/images/' + boxman.Definition.Map.Image[key];
			this._brushes[key] = img;
		}
	},	
	
	setBrush: function(brushName) {
		this._brushName = brushName;
		this._brush = this._brushes[brushName];
	},	
	
	_onSelectBrush: function(brushName) {
		this.setBrush(brushName);
	},
	
	_onFocusGrid: function(x, y) {
		if (!this._map) {
			return;
		}
		this.focusGrid(x, y);
	},
	
	_onEditGrid: function(argusObj) {
		if (!this._map) {
			return;
		}		
		this.editGrid(argusObj);	
	},
	
	_onEraseGrid: function(argusObj) {
		if (!this._map) {
			return;
		}		
    	this.eraseGrid(argusObj);	
	},		
    
	clear: function() {
		if (this._transformable) {
			this._context.restore();
		}
		
		var rect = this._canvasRect;
		this._context.clearRect(0, 0, rect.width, rect.height);
	},
	
	getMapNaturalRect: function() {
		return {
			width: boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * this._map.cols,
			height: boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * this._map.rows
		}; 
	},	

	drawMap: function() {
		var cnt = this._map.rows * this._map.cols;
		var argusObj = {
			brushName: ''
		};
		
		for (var i = 0; i < cnt; i++) {
			var brushName = this._map.getBrushName(i);
			if (brushName == 'EMPTY') {
				continue;
			}
			
			argusObj.brushName = brushName;
			argusObj.idx = i;
			this.drawGrid(argusObj);
		}
	},
	
	drawGrids: function(grids) {
		var argusObj = {};
		var direction = this._map.getDirectionByCoords(grids[0].x, grids[0].y, grids[1].x, grids[1].y);
		var brushName;
		for (var i = 0; i < grids.length; i++) {
			brushName = this._map.getBrushName(grids[i].x, grids[i].y);
			if (brushName == 'MAN') {
				brushName = this._manBrushWithDirection(direction);
			}
			
			argusObj.brushName = brushName;
			argusObj.x = grids[i].x;
			argusObj.y = grids[i].y;
			
			this.drawGrid(argusObj);
		}
	},
	
	_manBrushWithDirection: function(direction) {
		return 'MAN_' + direction;
	},	
	
	drawGrid: function(argusObj) {
		argusObj.syncData = false;
		this.editGrid(argusObj);
	},
	
	eraseGrid: function(argusObj) {
		argusObj.brushName = 'EMPTY'
		argusObj.erase = true;
		this.editGrid(argusObj);
	},
	
	/**
	 * argusObj: {
	 *   x: Number,			// x of grid coord
	 *   y: Number,			// y of grid coord
	 *   idx: Number,       // grid offset index
	 *   brushName: string, // if it is null or empty, will use current selected brush when draw grid
	 *   erase: boolean,    // only set it to ture when erase grid in edit map mode
	 *   syncData: boolean, // only set it to ture when edit/draw grid in edit map mode
	 * }
	 */
	editGrid: function(argusObj) {
		var coord = {};
		if (typeof argusObj.idx == 'number') {
			coord = this._map.index2Coord(argusObj.idx);
		} else {
			coord.x = argusObj.x;
			coord.y = argusObj.y;
		}
		
		var brushName = argusObj.brushName || this._brushName;
		var mergedInfo = this._map.getLayersMergedInfo(coord.x, coord.y, brushName);
		if (argusObj.syncData && mergedInfo.oldVal == mergedInfo.newVal) {
			return; 
		}
		
		var oldBrushName = this._brushName;
		this.setBrush(brushName);
		if (!argusObj.erase && mergedInfo.boxOnDestination) {
			this.setBrush('REDAY_BOX');
		}
		
		var drawOffset = boxman.assistor.logicCoord2ClientOffset(coord.x, coord.y);
		this._drawImage(this._brush, drawOffset.x, drawOffset.y);
		this.setBrush(oldBrushName);
		
		if (argusObj.syncData) {
			this._map.set(coord.x, coord.y, mergedInfo.newVal);
		}
	},	
	
	focusGrid: function(x, y, withBrushIndicator) {
		if (this._lastFocusGrid.x >= 0) {
			this.unfocusGrid(this._lastFocusGrid.x, this._lastFocusGrid.y);	
		}
		
		if (withBrushIndicator) {//@todo - keep or abandom
			this.drawGrid({
				x: x,
				y: y,
				brushName: this._brushName,
				syncData: false
			});				
		}
		
		var rect = boxman.assistor.getLogicCoordRect(x, y);
		this._setCtxStyle('Focus');
		this._context.fillRect(rect.left, rect.top, rect.width, rect.height);
		rect = boxman.assistor.enlargeRect(rect, -1);
		this._context.strokeRect(rect.left, rect.top, rect.width, rect.height);
		this.setLastFocusGrid(x, y);			
	},

	unfocusGrid: function(x, y) {
		var rect = boxman.assistor.getLogicCoordRect(x, y);
		this._context.clearRect(rect.left, rect.top, rect.width, rect.height);

		this.drawGrid({
			x: x,
			y: y,
			brushName: this._map.getBrushName(x, y)
		});
	},

	_drawImage: function(brush, offsetX, offsetY) {
		this._context.drawImage(brush, offsetX, offsetY);
	},
	
	_setCtxStyle: function(style) {
		this._context.strokeStyle = boxman.Definition.Ctx.StrokeStyle[style].COLOR;
		this._context.lineWidth = boxman.Definition.Ctx.StrokeStyle[style].WIDTH;
		this._context.fillStyle = boxman.Definition.Ctx.FillStyle[style].COLOR;
	},	
	
	drawMapGridBorders: function() {
		var mapNaturalRect = this.getMapNaturalRect();
		this._setCtxStyle('Normal');
		this._context.beginPath();
		var i;
		for (i = 0; i <= this._map.rows; i++) {
			this._context.moveTo(0, boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * i);
			this._context.lineTo(mapNaturalRect.width, boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * i);
		}
		for (i = 0; i <= this._map.cols; i++) {
			this._context.moveTo(boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * i, 0);
			this._context.lineTo(boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * i, mapNaturalRect.height);							
		}
		this._context.stroke();
	}
});