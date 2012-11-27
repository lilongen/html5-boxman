boxman.model.map = function() {};

jQuery.extend(boxman.model.map.prototype, {
	
	uuid: null, 
	
	rows: -1,
	
	cols: -1,
	
	data: null,
	
	_offsets: [],

	_manCoord: {
		x: -1,
		y: -1
	},
	
	_directions: ['LEFT', 'UP', 'RIGHT', 'DOWN'],
	
	_leftBoxes: 0,
		
	init: function(mapInfo) {
		if (arguments.length == 0) {
			this.uuid = boxman.assistor.uuid();
			this.rows = boxman.Definition.Map.Rect.ROWS;
			this.cols = boxman.Definition.Map.Rect.COLS;
			this.data = '';
		} else {
			this.uuid = mapInfo.uuid;
			this.rows = mapInfo.rows;
			this.cols = mapInfo.cols;
			this.data = mapInfo.data;
		}
		
        this._initOffsetsAndLeftBoxes();
	},
	
	_initOffsetsAndLeftBoxes: function() {
		var cnt = this.rows * this.cols;
		for (var i = 0; i < cnt; i++) {
			this._offsets[i] = this.data  ? parseInt(this.data.substr(2 * i, 2)) : 0;
			var layer1 = this._getLayer1(this._offsets[i]);
			var layer2 = this._getLayer2(this._offsets[i]);
			if (this._isManValue(layer2)) {
				var coord = this.index2Coord(i);
				this.setManCoord(coord.x, coord.y);
			}
			if (this._isBoxValue(layer2)) {
				this._leftBoxes++;
			}			
		}	    
	},
	
	restore: function() {
	    this._leftBoxes = 0;
	    this._initOffsetsAndLeftBoxes();    
	},
	
	reset: function() {
		if (this.rows == -1) {
			return;
		}
		this.uuid = null;
		this.rows = -1;
		this.cols = -1;
		this.data = null;
		this._offsets.splice(0);
		this._leftBoxes = 0;
	},
	
	index2Coord: function(idx) {
		return {
			x: idx % this.cols,
			y: Math.floor(idx / this.cols)
		};
	},
	
	coord2Index: function(x, y) {
		return y * this.cols + x;
	},
	
	_getMapDataKeyByValue: function(val) {
		var mapDataKey = 'EMPTY';
		for (var key in boxman.Definition.Map.Data) {
			if (boxman.Definition.Map.Data[key] == val) {
				mapDataKey = key;
				break;
			}
		}
		
		return mapDataKey;	
	},
	
	_isBoxOnDestination: function(layer1, layer2) {
		return layer1 == boxman.Definition.Map.Data.DESTINATION && layer2 == boxman.Definition.Map.Data.BOX;
	},
	
	getBrushName: function() {
		var idx = -1;
		if (arguments.length == 1) {
			idx = arguments[0];
		} else {
			idx = this.coord2Index(arguments[0], arguments[1]);
		}
		
		var val = this.get(idx);
		var brushName = 'EMPTY';
		if (val < 10) {
			brushName = this._getMapDataKeyByValue(val);
		} else {
			var layer1 = this._getLayer1(val);
			var layer2 = this._getLayer2(val);
			
			if (this._isBoxOnDestination(layer1, layer2)) {
				brushName = 'REDAY_BOX';
			} else {
				brushName = this._getMapDataKeyByValue(layer2);
			}	
		}
		
		return brushName;
	},
	
	getManCoord: function() {
		return this._manCoord;
	},
	
	setManCoord: function(x, y) {
		this._manCoord.x = x;
		this._manCoord.y = y;
		
	},
	
	/**
	 * get(idx)
	 * get(x, y)
	 * 
	 */	
	get: function() {
		var idx = -1;
		if (arguments.length == 1) {
			idx = arguments[0];
		} else {
			idx = this.coord2Index(arguments[0], arguments[1]);
		}
		
		return this._offsets[idx];
	},
	
	/**
	 * set(idx, data)
	 * set(x, y, data)
	 * 
	 */
	set: function() {
		var idx = -1;
		var val = '';
		if (arguments.length == 2) {
			idx = arguments[0];
			val = arguments[1];
		} else {
			idx = this.coord2Index(arguments[0], arguments[1]);
			val = arguments[2];
		}
		
		this._offsets[idx] = val;
	},
	
	/**
	 * getLayersMergedInfo(idx, brush)
	 * getLayersMergedInfo(x, y, brush)
	 * 
	 */	
	getLayersMergedInfo: function() {
		var idx = -1;
		var brush = '';
		if (arguments.length == 2) {
			idx = arguments[0];
			brush = arguments[1];
		} else {
			idx = this.coord2Index(arguments[0], arguments[1]);
			brush = arguments[2];			
		}

		var val = this.get(idx);
		
		var layer1 = this._getLayer1(val);
		var layer2 = this._getLayer2(val);
		if (boxman.Definition.Map.Data[brush] < boxman.Definition.Map.Data.BOX) {
			layer1 = boxman.Definition.Map.Data[brush];
			layer2 = 0;
		} else {
			if (layer1 == 0) {
				layer1 = boxman.Definition.Map.Data.FLOOR;
			}
			layer2 = boxman.Definition.Map.Data[brush]; 
		}
		
		return {
			layer1: layer1,
			layer2: layer2,
			oldVal: val,
			newVal: this._mergedLayers(layer1, layer2),
			boxOnDestination: this._isBoxOnDestination(layer1, layer2)
		};
	},
	
	_getLayer1: function(val) {
		return val % 10;
	},
	
	_getLayer2: function(val) {
		return Math.floor(val / 10);
	},
	
	_mergedLayers: function(layer1, layer2) {
		return layer1 + 10 * layer2
	},
	
	_getValidAreaBoundary: function() {
		var lt = {
			x: this.cols - 1,
			y: this.rows - 1
		};
		var br = {
			x: 0,
			y: 0
		};
		
		var cnt = this.rows * this.cols;
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				var idx = i * this.cols + j;
				if (this._offsets[idx] > 0) {
					lt.x = Math.min(lt.x, j);
					lt.y = Math.min(lt.y, i);
					
					br.x = Math.max(br.x, j);
					br.y = Math.max(br.y, i);
				}
			}
		}
		
		return {
			lt: lt,
			br: br	
		}
	},
	
	fillPaddingToMakeWholeEditable: function() {
		if (this.cols == boxman.Definition.Map.Rect.COLS && this.rows == boxman.Definition.Map.Rect.ROWS) {
			return;
		}
		var lt = {
			x: 0,
			y: 0
		};
		var rb = {
			x: 0,
			y: 0
		};		
		
		lt.x = Math.floor((boxman.Definition.Map.Rect.COLS - this.cols) / 2);
		lt.y = Math.floor((boxman.Definition.Map.Rect.ROWS - this.rows) / 2);
		rb.x = lt.x + this.cols;
		rb.y = lt.y + this.rows;
		
		var filled = [];
		for (var i = 0; i < boxman.Definition.Map.Rect.COLS; i++) {
			for (var j = 0; j < boxman.Definition.Map.Rect.ROWS; j++) {
				var idx = j * boxman.Definition.Map.Rect.COLS + i;
				if (i < lt.x || j < lt.y
					|| i >= rb.x || j >= rb.y) {
					filled[idx] = 0;
				} else {
					var idxData = (j - lt.y) * this.cols + (i - lt.x);
					filled[idx] = this._offsets[idxData];
				}
			}
		}
		
		this.cols = boxman.Definition.Map.Rect.COLS;
		this.rows = boxman.Definition.Map.Rect.ROWS;
		
		jQuery.extend(this._offsets, filled);
	},
	
	_validRowsCols: function(boundary) {
		return {
			rows: boundary.br.y - boundary.lt.y + 1,
			cols: boundary.br.x - boundary.lt.x + 1
		};
	},
	
	isBarrier: function(x, y) {
		var layer1 = this._getLayer1(this.get(x, y));
		return layer1 == boxman.Definition.Map.Data.WALL || layer1 == boxman.Definition.Map.Data.EMPTY;
	},
	
	isBox: function(x, y) {
		var layer2 = this._getLayer2(this.get(x, y));
		return layer2 == boxman.Definition.Map.Data.BOX;
	},
	
	isMan: function(x, y) {
		var layer2 = this._getLayer2(this.get(x, y));
		return layer2 == boxman.Definition.Map.Data.MAN;
	},
	
	isDestination: function(x, y) {
		var layer1 = this._getLayer1(this.get(x, y));
		return layer1 == boxman.Definition.Map.Data.DESTINATION;
	},	
	
	_isBoxValue: function(val) {
		return val == boxman.Definition.Map.Data.BOX;
	},
	
	_isDestinationValue: function(val) {
		return val == boxman.Definition.Map.Data.DESTINATION;
	},		

	_isManValue: function(val) {
		return val == boxman.Definition.Map.Data.MAN;
	},		
	
	directionNext: function(x, y, direction) {
		var offset = -1;
		var newX = x;
		var newY = y;
		switch (direction) {
			case 'LEFT':
				newX -= 1; 
				break;
			case 'UP':
				newY -= 1;
				break;
			case 'RIGHT':
				newX += 1;
				break;
			case 'DOWN':
				newY += 1;
				break;
		}

		return {
			x: newX,
			y: newY,
			invalid: (newX < 0
					|| newY < 0 
					|| newX >= this.cols
					|| newY >= this.rows)
		};
	},
	
	slideGridsLayer2: function(grids, /*1: normal foward, -1: back(history go(-1))*/flag) {
		if (arguments.length == 2 && flag == -1) {
			for (var i = 0; i <= grids.length - 1; i++) {
				if (i < grids.length - 1) {
					this._slideLayer2(grids[i + 1].x, grids[i + 1].y, grids[i].x, grids[i].y);	
				} else {
					this._removeLayer2(grids[i].x, grids[i].y);
				}
			}
			this.setManCoord(grids[0].x, grids[0].y);		
		} else {
			for (var i = grids.length - 1; i >= 0; i--) {
				if (i >= 1) {
					this._slideLayer2(grids[i - 1].x, grids[i - 1].y, grids[i].x, grids[i].y);	
				} else {
					this._removeLayer2(grids[i].x, grids[i].y);
				}
			}
			this.setManCoord(grids[1].x, grids[1].y);			
		}
	},
	
	getDirectionByCoords: function(x1, y1, x2, y2) {
		if (x1 == x2) {
			return y2 < y1 ? /*UP*/this._directions[1] : /*DOWN*/this._directions[3]; 
		} else {
			return x2 < x1 ? /*LEFT*/this._directions[0] : /*RIGHT*/this._directions[2];
		}
	},
	
	_removeLayer2: function(x, y) {
		var val = this.get(x, y);
		var layer1 = this._getLayer1(val);
		var layer2 = this._getLayer2(val);
		this.set(x, y, this._mergedLayers(layer1, 0));
	},
	
	_slideLayer2: function(fromX, fromY, toX, toY) {
		var fromVal = this.get(fromX, fromY);
		var toVal = this.get(toX, toY);
		var fromLayer1 = this._getLayer1(fromVal);
		var fromLayer2 = this._getLayer2(fromVal);
		var toLayer1 = this._getLayer1(toVal);
		var toLayer2 = this._getLayer2(toVal);
		
		this.set(toX, toY, this._mergedLayers(toLayer1, fromLayer2));
		
		if (this._isDestinationValue(toLayer1) && this._isBoxValue(fromLayer2)) {
			this._leftBoxes--;
		}
		if (this._isDestinationValue(fromLayer1) && this._isBoxValue(fromLayer2)) {
			this._leftBoxes++;
		}		
	},
	
	isLegal: function() {
		var destCnt = 0;
		var boxCnt = 0;
		var manCnt = 0;
		for (var i = 0; i < this.cols; i++) {
			for (var j = 0; j < this.rows; j++) {
				if (this.isMan(i, j)) {
					manCnt++;
					continue;
				}
				if (this.isDestination(i, j)) {
					destCnt++;
					continue;
				}
				if (this.isBox(i, j)) {
					boxCnt++;
					continue;
				}
			}	
		}
		
		return manCnt == 1 && boxCnt == destCnt && boxCnt > 0;
	},
	
	isPassed: function() {
		return this._leftBoxes == 0;
	},
	
	getArrivedableInArounds: function(x, y) {
		var directions = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
		
		for (var i = 0; i < 4; i++) {
			var next = this.directionNext(x, y, directions[i]);
			if (next.invalid) {
				continue;
			}
			if (this.isBarrier(next.x, next.y)) {
				continue;
			}
			if (this.isBox(next.x, next.y)) {
				continue;
			}
			
			return {
				x: next.x,
				y: next.y,	
				valid: true
			};
		}
		
		return {
			valid: false
		};
	},
	
	getArounds: function(x, y) {
		var arrounds = [];		
		for (var i = 0; i < 4; i++) {
			var next = this.directionNext(x, y, this._directions[i]);
			if (next.invalid) {
				continue;
			}
			
			arrounds.push({x: next.x, y: next.y});
		}
		
		return arrounds;
	},
	
	toMapInfo: function() {
		var boundary = this._getValidAreaBoundary();
		var validRowsCols = this._validRowsCols(boundary);
		var data = '';
		for (var i = boundary.lt.y; i <= boundary.br.y; i++) {
			for (var j = boundary.lt.x; j <= boundary.br.x; j++) {
				var idx = i * this.cols + j;
				data += (this._offsets[idx] < 10 ? '0' : '') + this._offsets[idx];	
			}
		}		

		return {
			uuid: this.uuid,
			rows: validRowsCols.rows,
			cols: validRowsCols.cols,
			data: data	
		};
	}
});

