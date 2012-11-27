boxman.util.BstarPath = {
		_map: null,
		
		_triggerAlgorithmEvent: false,
		
		_dest: {
		    x: -1,
		    y: -1,
		    preCoord: null 
		},
		
		_src: {
		    x: -1,
		    y: -1,
		    preCoord: null 
		},
		
		setTriggerAlgorithmEvent: function(bTrigger) {
		    this._triggerAlgorithmEvent = bTrigger;
		},
		
		_existedCoordList: {},
		
		_spiltFlag : -1,
		
		findPath : function(beginCoord, direction) {
			if (!beginCoord) {
				beginCoord = this._src;
			}
			var endCoord = this._dest;
			if (beginCoord.x == endCoord.x && beginCoord.y == endCoord.y) {
				this.getPath(beginCoord, endCoord);
				return;
			}
			if (direction == null) {
				direction = this.getDirection(beginCoord.x, beginCoord.y, endCoord.x, endCoord.y);
			}
			this.goDirection(beginCoord, direction);			
			if (this._spiltFlag == 0) {
				alert("No path!");
			}
		},
		
		getDirection : function(beginX, beginY, endX, endY) {
			var offsetX = endX - beginX;
			var offsetY = endY - beginY;
			var dirction = '';
			if (Math.abs(offsetX) > Math.abs(offsetY)) {
				if (offsetX > 0) {
					dirction = 'right';
				} else {
					dirction = 'left';
				}
			} else {
				if (offsetY > 0) {
					dirction = 'up';
				} else {
					dirction = 'down';
				}
			}
			return dirction;
			
		}, 
		
		isExistedCoord : function(currentCoord) {
			var isExisted = false;
			for (var i = 0; i < this._existedCoordList.length; i++) {
				if (this._existedCoordList[i].x == currentCoord.x
						&& this._existedCoordList[i].y == currentCoord.y) {
					isExisted = true;
					break;
				}
			}
			return isExisted;
		},
		
		goDirection : function (beginCoord, direction) {
			var newCoord = {
					x: -1,
					y: -1,
					preCoord : null
			};
			switch(direction) {
				case "right" : {
					newCoord.x = beginCoord.x + 1;
					newCoord.y = beginCoord.y;
				} 
				break;
				case "left" : {
					newCoord.x = beginCoord.x - 1;
					newCoord.y = beginCoord.y;
				} 
				break;
				case "up" : {
					newCoord.x = beginCoord.x;
					newCoord.y = beginCoord.y + 1;
				} 
				break;
				case "down" : {
					newCoord.x = beginCoord.x;
					newCoord.y = beginCoord.y - 1;
				} 
				break;			
			}
			if (this._map.isBarrier(newCoord.x, newCoord.y)) {
				this.splitePath(beginCoord, direction);
				if (this._spiltFlag == -1) {
					this._spiltFlag = 2;
				} else {
					this._spiltFlag = this._spiltFlag + 2;
				}
			} else {
				this.porcessNewCoord(beginCoord, newCoord, direction);
			}
		},
		porcessNewCoord : function(oldCoord, newCoord, direction) {
			if (this.isExistedCoord(newCoord)) {
				this._spiltFlag--;
				return;
			} else {
				newCoord.preCoord = oldCoord;
				this._existedCoordList.put(newCoord);
				if (oldCoord.origDir !== direction) {
					newCoord.origDir = oldCoord.origDir;
					newCoord.curDir = direction;
					this.findPath(newCoord, oldCoord.origDir);
				} else {
					this.findPath(newCoord);
				}
			}
		},
		splitePath : function(beginCoord, direction) {
			if (direction === "right" || direction === "left") {
				if (beginCoord.origDir === '' || beginCoord.origDir == null
						|| typeof(beginCoord.origDir) === 'undefine') {
					this.goYpath(beginCoord, direction, 'up');
					this.goYpath(beginCoord, direction, 'down');	
				} else {
					this.goYpath(beginCoord, direction, beginCoord.curDir);
				}		
			} else {
				if (beginCoord.origDir === '' || beginCoord.origDir == null
						|| typeof(beginCoord.origDir) === 'undefine') {
					this.goXpath(beginCoord, direction, 'left');	
					this.goXpath(beginCoord, direction, 'right');	
				} else {
					this.goXpath(beginCoord, direction, beginCoord.curDir);
				}
			}
		},
		goYpath : function(beginCoord, origDir, curDir) {
			var spliteYCoord = {
					x: -1,
					y: -1,
					preCoord : null
			};
			spliteYCoord.x = beginCoord.x;
			if (direction === 'up') {
				spliteYCoord.y = beginCoord.y + 1;
			} else {
				spliteYCoord.y = beginCoord.y - 1;
			}
			if (this._map.isBarrier(spliteYCoord.x, spliteYCoord.y)) {
				//todo: here need to consider all block issue.
				//Stop here.
				return;
			} else {
				spliteYCoord.preCoord = beginCoord;
				spliteYCoord.origDir = origDir;
				spliteYCoord.curDir = curDir;
				this.findPath(spliteYCoord, origDir);
			}
		},
		goXpath : function(beginCoord, origDir, curDir) {
			var spliteXCoord = {
					x: -1,
					y: -1,
					preCoord : null
			};
			spliteXCoord.y = beginCoord.y;
			if (direction === 'left') {
				spliteXCoord.x = beginCoord.x - 1;
			} else {
				spliteXCoord.x = beginCoord.x + 1;
			}
			if (this._map.isBarrier(spliteXCoord.x, spliteXCoord.y)) {
				//todo: here need to consider all block issue.
				//Stop here.
				return;
			} else {
				spliteXCoord.preCoord = beginCoord;
				spliteXCoord.origDir = origDir;
				spliteXCoord.curDir = curDir;
				this.findPath(spliteXCoord, origDir);
			}
		},
		getPath : function(beginCoord, endCoord) {
			var paths = new Array();
			paths.push(endCoord);
			while (true) {
				var previousCoord = endCoord.preCoord;
				paths.push(previousCoord);
				if (previousCoord.x == beginCoord.x && previousCoord.y ==  beginCoord.y) {
					break;
				}
			}
			return paths;
		},		
		setMap: function(map) {
			this._map = map;
		}
}