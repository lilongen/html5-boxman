boxman = {};
boxman.view = {};
boxman.model = {};
boxman.controller = {};
boxman.nls = {};
boxman.util = {};
boxman.Runtime = {};

boxman.init = function() {
	var jqXman = jQuery('.boxman');
	
	boxman.Runtime.jqRoot = jqXman;
    boxman.Runtime.jqXmanCanvas = jqXman.find('.xmanCanvas');
    boxman.Runtime.ctx2d = boxman.Runtime.jqXmanCanvas[0].getContext('2d');
	
	boxman.Runtime.controller = new boxman.controller.CoreController();
	boxman.Runtime.controller.init();
   	boxman.Runtime.controller.showHome();
	
	boxman.Runtime.dragButton = -2;
	var funDragHandler = function(logicCoord) {
		if (boxman.Runtime.dragButton == 0) {//left drag
			PubSub.publish('evt_on_edit_grid', {
	    		x: logicCoord.x, 
	    		y: logicCoord.y,
	    		syncData: true
	    	});
		} else if (boxman.Runtime.dragButton == 2){//right drag
			PubSub.publish('evt_on_erase_grid', {
	    		x: logicCoord.x, 
	    		y: logicCoord.y,
	    		syncData: true
	    	});			
		}
		
		PubSub.publish('evt_on_focus_grid', logicCoord.x, logicCoord.y);	
	};
	
	boxman.Runtime.jqXmanCanvas.mousedown(function(e) { //canvas
		if (boxman.Runtime.SHOWN_DIALOG) {
			return;
		}
		
		if (boxman.Runtime.mode == boxman.Definition.RunMode.MAP) {	
			(function setDragInfoByMousedown(e) {
				if (e.button == 0 || e.button == 2) {
					boxman.Runtime.dragButton = e.button;	
				} else {
					boxman.Runtime.dragButton = -1;
				}
				
			}(e));
		}
		
		var logicCoord = boxman.assistor.getLogicCoordFromMouseEvent(e);
		if (!logicCoord) {
			return;	
		}
		if (boxman.Runtime.mode == boxman.Definition.RunMode.MAP) {
			funDragHandler(logicCoord);
		} else if (boxman.Runtime.mode == boxman.Definition.RunMode.GAME) {//game mode
			PubSub.publish('evt_on_go_to', logicCoord.x, logicCoord.y);
		}
	}).mouseup(function(e) { //canvas
		(function setDragInfoByMouseup(e) {
			boxman.Runtime.dragButton = -1;			
		})(e);
	}).mousemove(function(e) { //canvas
		if (boxman.Runtime.mode != boxman.Definition.RunMode.MAP || boxman.Runtime.SHOWN_DIALOG) {
			return;
		}
		
		var logicCoord = boxman.assistor.getLogicCoordFromMouseEvent(e);
		if (!logicCoord) {
			return;	
		}
		
		funDragHandler(logicCoord);
	});
	
	jQuery(document).contextmenu(function() { //document
		return false;
	}).mouseup(function(e) { //document
		(function setDragInfoByMouseup(e) {
			boxman.Runtime.dragButton = -2;			
		})(e);
	}).keydown(function(e) { //document
		if (boxman.Runtime.mode != boxman.Definition.RunMode.GAME  || boxman.Runtime.SHOWN_DIALOG) {
			return;
		}
		if (e.shiftKey || e.altKey) {
			return;
		}
		
		if (e.ctrlKey) {
			if (e.keyCode == 90 || e.keyCode == 122) {// ^Z
				PubSub.publish('evt_on_history', 'UNDO');
			}
			if (e.keyCode == 89 || e.keyCode == 121) {// ^Y
				PubSub.publish('evt_on_history', 'REDO');
			}
			if (e.keyCode == 68 || e.keyCode == 104) {// ^H
				//PubSub.publish('evt_on_back_home');
			}		
			
			return;
		}
	
		if (e.keyCode == 37
			|| e.keyCode == 38
			|| e.keyCode == 39
			|| e.keyCode == 40) {
			PubSub.publish('evt_on_direction', boxman.Definition.KeyCode2Arrow[e.keyCode]);
		}
	});
}
