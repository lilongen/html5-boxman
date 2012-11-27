boxman.assistor = {
	
	getModeKey: function(mode) {
		for (var key in boxman.Definition.RunMode) {
			if (boxman.Definition.RunMode[key] == mode) {
				return key
			}
		}
		
		return '';
	},
	
	getModeKeys: function() {
		var keys = [];
		for (var key in boxman.Definition.RunMode) {
			keys.push(key);
		}
		
		return keys;
	},	

	getRuntimeMapSize: function() {
		return {
			width: boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * boxman.Runtime.map.cols,
			height: boxman.Definition.Map.Rect.GRID_SIDE_LENGTH * boxman.Runtime.map.rows
		}; 
	},
	
	clientOffset2LogicCoord: function(x, y) {
		return {
			x: Math.floor(x / boxman.Definition.Map.Rect.GRID_SIDE_LENGTH),
			y: Math.floor(y / boxman.Definition.Map.Rect.GRID_SIDE_LENGTH)
		};
	},
	
	getLogicCoordRect: function(x, y) {
		var offset = this.logicCoord2ClientOffset(x, y);
		
		return {
			left: offset.x,
			top: offset.y,
			width: boxman.Definition.Map.Rect.GRID_SIDE_LENGTH,
			height: boxman.Definition.Map.Rect.GRID_SIDE_LENGTH
		};
	},
	
	getLogicCoordCenter : function(x, y) {
		var rect = this.getLogicCoordRect(x, y);
		
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2
		};
	},
	
	enlargeRect: function(rect, val) {
		return {
			left: rect.left - val,
			top: rect.top - val,
			width: rect.width + 2 * val,
			height: rect.height + 2 * val
		};
	},
	
	logicCoord2ClientOffset: function(x, y) {
		return {
			x: x * boxman.Definition.Map.Rect.GRID_SIDE_LENGTH,
			y: y * boxman.Definition.Map.Rect.GRID_SIDE_LENGTH
		};
	},
	
	getLogicCoordFromMouseEvent: function(e) {
    	var xInView = e.pageX - boxman.Runtime.canvasValidRect.left;
    	var yInView = e.pageY - boxman.Runtime.canvasValidRect.top;
    	if (   xInView < 0
    		|| yInView < 0 
    		|| xInView > boxman.Runtime.canvasValidRect.width
    		|| yInView > boxman.Runtime.canvasValidRect.height) {
    		return null;
    	}
    	return this.clientOffset2LogicCoord(xInView, yInView);
	},
	
	sameAsLastGrid: function(x, y) {
		return x == boxman.context.lastFocusGrid.x && y == boxman.context.lastFocusGrid.y;
	},
	
	deleteRecord: function(uuid) {
		localStorage.removeItem('BOXMAN_RECORD_' + uuid)
	},
	
	getRecord: function(uuid) {
		return jQuery.parseJSON(localStorage.getItem('BOXMAN_RECORD_' + uuid));	
	},
	
	getRecordUuids: function() {
		var uuids = localStorage.getItem('BOXMAN_RECORD_UUIDS');
		if (uuids == null || typeof uuids == 'undefined') {
			uuids = [];
		} else {
			uuids = jQuery.parseJSON(uuids);
		}
		
		return uuids;
	},	
	
	getCustomizedMapUuids: function() {
		var uuids = localStorage.getItem('BOXMAN_CUST_LEVEL_UUIDS');
		if (uuids == null || typeof uuids == 'undefined') {
			uuids = [];
		} else {
			uuids = jQuery.parseJSON(uuids);
		}
		
		return uuids;
	},
	
	getBuiltinMapUuids: function() {
		var uuids = [];
		for (var i = 0; i < boxman.Maps.length; i++) {
			uuids.push(boxman.Maps[i].uuid);
		}
		
		return uuids;
	},
	
	getMapAndNextUuidByUuid: function(uuid) {
	    var builtinMapUuids = boxman.Runtime.uuids.builtinMap;
	    var customizedMapUuids = boxman.Runtime.uuids.customizedMap;
	    
		var uuidIndex = builtinMapUuids.indexOf(uuid);
		var nextUuid = '';
		var map = null;
		if (uuidIndex >= 0) {
		    if (uuidIndex < builtinMapUuids.length - 1) {
		        nextUuid = builtinMapUuids[uuidIndex + 1];
		    } else {
		        if (customizedMapUuids.length > 0) {
		            nextUuid = customizedMapUuids[0];
		        }
		    }
		    map = boxman.Maps[uuidIndex];
		} else {
    		uuidIndex = customizedMapUuids.indexOf(uuid);
    		if (uuidIndex >= 0) {
    		    if (uuidIndex < customizedMapUuids.length - 1) {
    		        nextUuid = customizedMapUuids[uuidIndex + 1];
    		    }
                map = jQuery.parseJSON(localStorage.getItem('BOXMAN_CUST_LEVEL_' + uuid));    			
    		}
		}
		
		return {
		    nextUuid: nextUuid,
		    map: map
		};
	},
	
	deleteMap: function(uuid) {
		localStorage.removeItem('BOXMAN_CUST_LEVEL_' + uuid);
		var customizedMapUuids = boxman.Runtime.uuids.customizedMap; 
		customizedMapUuids.splice(customizedMapUuids.indexOf(uuid), 1);
		localStorage.setItem('BOXMAN_CUST_LEVEL_UUIDS', JSON.stringify(customizedMapUuids));
	},
	
	storeRecord: function(uuid, recordData) {
		var recordUuids = boxman.Runtime.uuids.record;
		var recordKey = 'BOXMAN_RECORD_' + uuid;
		if (recordUuids.indexOf(uuid) == -1) {
			recordUuids.push(uuid);
			localStorage.setItem(recordKey, JSON.stringify(recordData));	
			localStorage.setItem('BOXMAN_RECORD_UUIDS', JSON.stringify(recordUuids));
		} else {
			localStorage.setItem(recordKey, JSON.stringify(recordData));
		}
	},
	
	storeMap: function(map) {
		var customizedMapUuids = boxman.Runtime.uuids.customizedMap;
		var serializedMap = JSON.stringify(map.toMapInfo());
		if (customizedMapUuids.indexOf(map.uuid) == -1) {
			customizedMapUuids.push(map.uuid);
			localStorage.setItem('BOXMAN_CUST_LEVEL_' + map.uuid, serializedMap);	
			localStorage.setItem('BOXMAN_CUST_LEVEL_UUIDS', JSON.stringify(customizedMapUuids));
		} else {
			localStorage.setItem('BOXMAN_CUST_LEVEL_' + map.uuid, serializedMap);
			this.deleteRecord(map.uuid);
		}
	},	
	
	constructOverallMapRecordUuids: function() {
		boxman.Runtime.uuids = {
			record: this.getRecordUuids(),
			customizedMap: this.getCustomizedMapUuids(),
			builtinMap: this.getBuiltinMapUuids()
		};
	},	
	
	_UUID_CHARS: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
	uuid: function() {
		var chars = this._UUID_CHARS, uuid = new Array(36), rnd = 0, r;
		for (var i = 0; i < 36; i++) {
			if (i == 8 || i == 13 || i == 18 || i == 23) {
				uuid[i] = '-';
			} else if (i == 14) {
				uuid[i] = '4';
			} else {
				if (rnd <= 0x02) {
					rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
				}
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
		
		return uuid.join('');
	},
	
	keys: function(obj) {
		var keys = [];
		for(var i in obj) {
			if (obj.hasOwnProperty(i)) {
				keys.push(i);
			}
		}
		return keys;
	}
};
