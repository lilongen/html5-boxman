boxman.controller.CoreController = function() {};

jQuery.extend(boxman.controller.CoreController.prototype, {
	
	_flagPathWalkInProgress: false,
	
	_walkInterval: 100,
	
	_demoPathAiAlgorithm: false,
	
	_pathAiDemoer: null,
	
	_pathAIer: boxman.util.DijkstraPath, //boxman.util.DijkstraPath, boxman.util.AstarPath
	
	_mainPainter: null,
	
	_previewPainter: null,
	
	_player: null,

	_unlockAllLevels: false,
	
	init: function() {
	    boxman.assistor.constructOverallMapRecordUuids();
	    
		PubSub.subscribe('action_switch_mode', this, this._switchMode);
		PubSub.subscribe('action_load_map', this, this._loadMap);
		PubSub.subscribe('action_select_level', this, this._openLevelSelector);
		PubSub.subscribe('action_play_next', this, this._playNext);
		PubSub.subscribe('action_playback', this, this._playback);

		PubSub.subscribe('evt_on_direction', this, this._onDirection);
		PubSub.subscribe('evt_on_history', this, this._onHistory);
		PubSub.subscribe('evt_on_go_to', this, this._onGoto);
		PubSub.subscribe('evt_on_back_home', this, this._onBackHome);
		PubSub.subscribe('evt_on_save_map', this, this._onSaveMap);
		PubSub.subscribe('evt_on_verify_map', this, this._onVerifyMap);
		PubSub.subscribe('evt_on_pathai_demo_finished', this, this._onPathAiDemoFinished);

		PubSub.subscribe('action_preview_map', this, this._previewMap);
		PubSub.subscribe('action_delete_map', this, this._deleteMap);

		this._initPathAiDemoer();
		this._initViews();
		this._initMap();

		this._mainPainter = new boxman.controller.Painter({
			context: boxman.Runtime.ctx2d, 
			transformable: true, 
			interactable: true,
			canvas: {
				width: boxman.Runtime.jqXmanCanvas.width(),
				height: boxman.Runtime.jqXmanCanvas.height()				
			}
		});
		var previewRect = boxman.Runtime.levelSelector.getPreviewCanvasRect();
		this._previewPainter = new boxman.controller.Painter({
			context: boxman.Runtime.levelSelector.getPreviewCanvasContext(), 
			transformable: true, 
			interactable: false,
			canvas: {
				width: previewRect.width,
				height: previewRect.height				
			}			
		});
		this._player = new boxman.controller.Player();
		this._audio = new boxman.controller.Audio();
		
		this._mainPainter.init();
		this._previewPainter.init();
		this._player.init(this._mainPainter);
		this._audio.init();
	},

	
	_setWalkInterval: function() {
		this._walkInterval = this._demoPathAiAlgorithm ? 300 : 100;
	},
	
	setDemoPathAiAlgorithm: function(bDemo) {
		this._setWalkInterval();
		if (this._flagPathWalkInProgress) {
			return;
		}
		
		this._demoPathAiAlgorithm = bDemo;
		this._pathAIer.setTriggerAlgorithmEvent(bDemo);
	},

	unlockAllLevels: function(unlock) {
		this._unlockAllLevels = unlock;
	},

	setPathAIer: function(pathAier) {
		if (this._flagPathWalkInProgress) {
			return;
		}
				
		if (pathAier) {
			this._pathAIer = pathAier;	
		}
		this._pathAIer.setMap(boxman.Runtime.map);
		this._pathAIer.setTriggerAlgorithmEvent(this._demoPathAiAlgorithm);
		this._pathAiDemoer.setAiExecutor(this._pathAIer);	
	},
	
	_initPathAiDemoer: function() {
		this._pathAiDemoer = new boxman.controller.PathAiDemoer();
		this._pathAiDemoer.init(this._pathAIer, boxman.Runtime.ctx2d);
	},
	
	_initViews: function() {
	    var container = '.boxman';

	    boxman.Runtime.home = new boxman.view.home();
	    boxman.Runtime.home.init(container);
		
		boxman.Runtime.toolbar = new boxman.view.toolbar();
	    boxman.Runtime.toolbar.init(container);
	    	    
	    boxman.Runtime.passedUI = new boxman.view.passedUI();
	    boxman.Runtime.passedUI.init(container);
	    
	    boxman.Runtime.levelSelector = new boxman.view.levelSelector();
		boxman.Runtime.levelSelector.init(container);
	},
	
	_initMap: function() {
		 boxman.Runtime.map = new boxman.model.map();
	},
	
	_switchMode: function(mode) {
	     this._mainPainter.reset();
		 this._player.reset();
		 boxman.Runtime.map.reset();
		 boxman.Runtime.mode = mode;
		 
		 if (mode == boxman.Definition.RunMode.GAME || mode == boxman.Definition.RunMode.PLAYER) {
		 	if (!boxman.Runtime.history) {
		 		boxman.Runtime.history = new boxman.model.history();
		 	}
			boxman.Runtime.history.reset(); 
		} else {
			boxman.Runtime.history = null;
		}
		
		this._attachMode2RootDom(mode);		
		this._behaviorViews(mode);
		this._setWalkInterval();
	},
	
	_attachMode2RootDom: function(mode) {
		var allModesKey =  boxman.assistor.getModeKeys().join(' ');
		var modeKey = boxman.assistor.getModeKey(mode); 
		boxman.Runtime.jqRoot.removeClass(allModesKey).addClass(modeKey);
	},
	
	_behaviorViews: function(mode) {
		this._hideDialogs();
		boxman.Runtime.jqXmanCanvas.show();
		boxman.Runtime.home.hide();
		boxman.Runtime.toolbar.show();
	},
	
	showHome: function() {
		boxman.Runtime.jqXmanCanvas.hide();
		boxman.Runtime.toolbar.hide();
		boxman.Runtime.home.show();
		this._hideDialogs();
	},
	
	setNextMapUuid: function(uuid) {
	    boxman.Runtime.nextMapUuid = uuid;
	},
	
	_playNext: function() {
	    this._hideDialogs();
	    this._loadMap(boxman.Runtime.nextMapUuid);
	},
	
	_hideDialogs: function() {
		if (boxman.Runtime.SHOWN_DIALOG == 'levelSelector') {
			this._previewPainter.clear();	
		}
		boxman.Runtime.SHOWN_DIALOG = "";
		
	    boxman.Runtime.passedUI.hide();
	    boxman.Runtime.levelSelector.hide();  
	},
	
	_playback: function(uuid) {
	    this._hideDialogs();
	    
	    if (!uuid) {
	        boxman.Runtime.map.restore();      
	        this._mainPainter.drawMap();
	    } else {
	        this._loadMap(uuid);
	        var recordData = boxman.assistor.getRecord(uuid);
	        boxman.Runtime.history.reset(recordData);
	    }
	    
	    this._player.playback();
	},
	
	_loadMap: function(uuid) {
		this._hideDialogs();
		var map = null;
		if (uuid != -1) {
			var mapAndNextUuid = boxman.assistor.getMapAndNextUuidByUuid(uuid);
			map = mapAndNextUuid.map;
			this.setNextMapUuid(mapAndNextUuid.nextUuid);
		}

		if (map) {
			boxman.Runtime.map.init(map);
			if (boxman.Runtime.mode == boxman.Definition.RunMode.MAP) {
				boxman.Runtime.map.fillPaddingToMakeWholeEditable();
			}
			if (boxman.Runtime.mode == boxman.Definition.RunMode.GAME) {
				this.setPathAIer(null);
			}
		} else {
			boxman.Runtime.map.init();
		}
		
		if (boxman.Runtime.history) {//must have
		    boxman.Runtime.history.reset();        
		}
		
		this._mainPainter.clear();
		this._mainPainter.setMap(boxman.Runtime.map);
		this._mainPainter.drawMap();
		this._setCanvasValidRect();
	},
	
	_previewMap: function(uuid) {
	    if (!uuid) {
	        this._previewPainter.clear();
	        return;
	    }
	    
		var map = new boxman.model.map();
		map.init(boxman.assistor.getMapAndNextUuidByUuid(uuid).map);
		
		this._previewPainter.clear();	
		this._previewPainter.setMap(map);
		this._previewPainter.drawMap();
		
		delete map;
	},
	
	_deleteMap: function(uuid) {
        if (!uuid) {
            return;
        }
        this._previewPainter.clear();   
        boxman.assistor.deleteMap(uuid);        
    },
	
	_openLevelSelector: function() {
	    boxman.Runtime.levelSelector.show();
	    boxman.Runtime.SHOWN_DIALOG = "levelSelector";
	    this._layoutDialog('levelSelector');
	},

	_setCanvasValidRect: function() {
		if (!boxman.Runtime.canvasValidRect) {
			boxman.Runtime.canvasValidRect = {};
		}
		var offset = boxman.Runtime.jqXmanCanvas.offset();
		var mapSize = boxman.assistor.getRuntimeMapSize();
		var translateCoord = this._mainPainter.getTranslateCoord();
		boxman.Runtime.canvasValidRect.left = offset.left + translateCoord.x;
		boxman.Runtime.canvasValidRect.top = offset.top + translateCoord.y;
		
		boxman.Runtime.canvasValidRect.width = mapSize.width;
		boxman.Runtime.canvasValidRect.height = mapSize.height;
	},
	
	_layoutDialog: function(dialog) {
		var jqDialog = boxman.Runtime[dialog].me();
		var jqXmanCanvas = boxman.Runtime.jqXmanCanvas;
		jqDialog.css({
			left: jqXmanCanvas.offset().left + (jqXmanCanvas.width() - jqDialog[0].scrollWidth) / 2,
			top: jqXmanCanvas.offset().top + (jqXmanCanvas.height() - jqDialog[0].scrollHeight) / 2
		});
	},
	
	_onHistory: function(/*'UNDO' or 'REDO'*/historyAction) {
		var offset = historyAction == 'UNDO' ? -1 : 1;
		var grids = boxman.Runtime.history.get(offset);
		if (!grids) {
			return;
		}

		boxman.Runtime.map.slideGridsLayer2(grids, offset);
		this._mainPainter.drawGrids(grids);
	},
	
	_onBackHome: function() {
		this.showHome();
	},
	
	_onSaveMap: function() {
		boxman.assistor.storeMap(boxman.Runtime.map);
	},
	
	_onVerifyMap: function() {
		if (boxman.Runtime.map.isLegal()) {
			
		} else {
			
		}
	},
	
	_onGoto: function(x, y) {
		if (this._isPathWalkInProgress()) {
			return;
		}
		this._beginPathWalk();
		
		var map = boxman.Runtime.map;
		var manCoord = map.getManCoord();
		if (x == manCoord.x && y == manCoord.y) {
			PubSub.publish('evt_on_play_audio', "walk");
			this._endPathWalk();
			return;
		}
		if (map.isBarrier(x, y)) {
			PubSub.publish('evt_on_play_audio', "bang");
			this._endPathWalk();
			return;
		}
		if (map.isBox(x, y)) {
			var around = map.getArrivedableInArounds(x, y);
			if (!around.valid) {
				PubSub.publish('evt_on_play_audio', "bang");
				this._endPathWalk();
				return;
			}
			
			x = around.x;
			y = around.y;
		}
		
        var path = this._pathAIer.path(manCoord.x, manCoord.y, x, y);				
        
        if (this._demoPathAiAlgorithm) {
        	this.clearPathAiDemoMark();
			this.__path = path;
			var clonePath = [];
			jQuery.extend(true, clonePath, path);
			PubSub.publish('evt_on_play_audio', "walk");
			this._pathAiDemoer.demo(/*src*/manCoord, /*dest*/{x: x, y: y}, /*reversed path*/clonePath.reverse());
		} else {
			//PubSub.publish('evt_on_play_audio', "walk");
			this._walkOrEndBasePathCheck(path);
		}        
	},
	
	_walkOrEndBasePathCheck: function(path) {
		if (!path) {
			PubSub.publish('evt_on_play_audio', "bang");
			this._endPathWalk();
		} else {
			PubSub.publish('evt_on_play_audio', "walk");
			this._walk(path);
		}	    
	},
	
	_onPathAiDemoFinished: function() {
		var self = this;
		setTimeout(function() {
		    self._walkOrEndBasePathCheck(self.__path);
		}, 3000);
	},
	
	_walk: function(path) {
		var self = this;
		var walkGrids = [];
		
		for (var i = 1; i < path.length; i++) {
			walkGrids[i -1] = [
				{
					x: path[i - 1].x,
					y: path[i - 1].y
				},
				{
					x: path[i].x,
					y: path[i].y
				}				
			];
		}
		
		var idx = 0;
		var hWalkInterval = setInterval(function() {
			if (idx == walkGrids.length) {
				clearInterval(hWalkInterval);
				self._endPathWalk();
				return;
			}
			
			var grids = walkGrids[idx];
			boxman.Runtime.map.slideGridsLayer2(grids);
			self._mainPainter.drawGrids(grids);
			boxman.Runtime.history.add(grids);
            self._handleIfGamePassed();			    
			
			if (self._demoPathAiAlgorithm) {
				PubSub.publish('evt_on_walk_grids', grids);	
			}
			
			idx++;
		}, this._walkInterval);			
	},
	
	_isPathWalkInProgress: function() {
		return this._flagPathWalkInProgress;
	},
	
	_beginPathWalk: function() {
		this._flagPathWalkInProgress = true;
	},
	
	_endPathWalk: function() {
		this._flagPathWalkInProgress = false;
	},
	
	_onDirection: function(direction) {
		var coord = boxman.Runtime.map.getManCoord();
		var next = boxman.Runtime.map.directionNext(coord.x, coord.y, direction);
		
		if (next.invalid) {//out of boundary
			PubSub.publish('evt_on_play_audio', "bang");
			return;
		}
		if (boxman.Runtime.map.isBarrier(next.x, next.y)) {
			PubSub.publish('evt_on_play_audio', "bang");
			return;
		}		
		
		var nextIsBox = boxman.Runtime.map.isBox(next.x, next.y);
		if (!nextIsBox) {
			var grids = [
				{
					x: coord.x,
					y: coord.y
				},
				{
					x: next.x,
					y: next.y
				}
			];
			boxman.Runtime.map.slideGridsLayer2(grids);
			this._mainPainter.drawGrids(grids);
			boxman.Runtime.history.add(grids);
			this._handleIfGamePassed();
			PubSub.publish('evt_on_play_audio', "walk");
		} else {
			var nextNext = boxman.Runtime.map.directionNext(next.x, next.y, direction);
			if (nextNext.invalid) {
				PubSub.publish('evt_on_play_audio', "bang");
				return;
			}
			if (boxman.Runtime.map.isBarrier(nextNext.x, nextNext.y)
				|| boxman.Runtime.map.isBox(nextNext.x, nextNext.y)) {
				PubSub.publish('evt_on_play_audio', "bang");
				return;
			}
			var grids = [
				{
					x: coord.x,
					y: coord.y
				},
				{
					x: next.x,
					y: next.y
				},
				{
					x: nextNext.x,
					y: nextNext.y
				}
			];			
			boxman.Runtime.map.slideGridsLayer2(grids);
			this._mainPainter.drawGrids(grids);
			boxman.Runtime.history.add(grids);
			this._handleIfGamePassed();
			PubSub.publish('evt_on_play_audio', "push");
		}
	},
	
	_storeCurrentGameRecord: function() {
	    var uuid = boxman.Runtime.map.uuid;
	    var recordData = boxman.Runtime.history.data();
	    boxman.assistor.storeRecord(uuid, recordData);	    
	},
	
	_showPassedInfo: function() {
	    if (boxman.Runtime.nextMapUuid) {
	        boxman.Runtime.passedUI.show();
	        this._layoutDialog('passedUI');
	        boxman.Runtime.SHOWN_DIALOG = "passedUI";
	    } else {
            alert('Confgratuation, you passed all levels in the season!');	        
	    }	    
	},
	
	_handleIfGamePassed: function() {
	    if (boxman.Runtime.mode != boxman.Definition.RunMode.GAME) {
	        return;
	    }
	    if (!boxman.Runtime.map.isPassed()) {
	        return;
	    }
	    
        this._showPassedInfo();
        this._storeCurrentGameRecord();
	},
	
	clearPathAiDemoMark: function() {
		this._mainPainter.drawMap();	
	}
});