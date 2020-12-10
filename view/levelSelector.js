boxman.view.levelSelector = function() {};

jQuery.extend(boxman.view.levelSelector.prototype, {
	
	_me: null,
    
    _jqLevelListView: null,
    
    _jqMapPreviewer: null,
    
    _jqLevels: null,
    
    _idxHoveredLevel: null,
    
    _jqTitle: null,
	
	init: function(parent) {
	    var self = this;
		var html = '<div class="levelSelector">' +
		           '  <div class="dlgTitle"></div>' +
				   '  <canvas class="mapPreviewer" width="240" height="224"></canvas>' +
				   '  <div class="levelListView">' +
				   '  </div>' +
				   '</div>';
		
		this._me = jQuery(html).appendTo(parent);
		this._jqTitle = this._me.find(".dlgTitle");
		this._jqLevelListView = this._me.find(".levelListView");
		this._jqMapPreviewer = this._me.find(".mapPreviewer");
	},
	
	_getDlgTitle: function() {
        if (boxman.Runtime.mode == boxman.Definition.RunMode.GAME) {
            return boxman.nls.resource.levelSelector.gameModeTitle;
        } else if (boxman.Runtime.mode == boxman.Definition.RunMode.PLAYER) {
            return boxman.nls.resource.levelSelector.playerModeTitle;
        } else {
            return boxman.nls.resource.levelSelector.mapModeTitle;
        }
	},
	
	_setTitle: function() {
	   this._jqTitle.html(this._getDlgTitle);    
	},
	
	getPreviewCanvasContext: function() {
		return this._jqMapPreviewer[0].getContext('2d');
	},
	
	me: function() {
		return this._me;
	},
	
	show: function() {
	    this._setTitle();
		this._me.show();
		this.refresh();
	},
	
	refresh: function() {
	    this._constructLevels();
        if (this._idxHoveredLevel != -1) {
            PubSub.publish('action_preview_map', this._jqLevels.eq(this._idxHoveredLevel).attr('x'));
            this._jqLevels.eq(this._idxHoveredLevel).focus();    
        }
	},
	
	hide: function() {
		this._me.hide();
		this._idxHoveredLevel = -1;
	},	
	
	_constructLevels: function() {
	    var self = this;
	    this._jqLevelListView.find('table').remove();
        
		var shownMapUuids = null;
		var allMapUuids = boxman.Runtime.uuids.builtinMap.concat(boxman.Runtime.uuids.customizedMap);
		if (boxman.Runtime.mode == boxman.Definition.RunMode.PLAYER) {
			shownMapUuids = boxman.Runtime.uuids.record; 
		} else if (boxman.Runtime.mode == boxman.Definition.RunMode.MAP) {
			shownMapUuids = boxman.Runtime.uuids.customizedMap;
		} else {
			shownMapUuids = allMapUuids;
		}
		var output = '<table class="levelLayoutContainer">';
		output += this.generateLevelButtons(shownMapUuids, allMapUuids);
		output += '</table>';
		this._jqLevelListView.append(output);
		this._jqLevels = this._jqLevelListView.find('.level').click(function() {
			if (jQuery(this).hasClass('locked')) {
				if (!boxman.controller.CoreController.prototype._unlockAllLevels) {
					return;
				}
            }
		    self._onChooseLevel(this.getAttribute('x'));
		}).mouseover(function() {
		    if (self._idxHoveredLevel != -1) {
		        self._jqLevels.eq(self._idxHoveredLevel).removeClass('hovered');
		        var newIdx = self._jqLevels.index(this);
		        self._jqLevels.eq(newIdx).addClass('hovered');
		        self._idxHoveredLevel = newIdx;
		    }
            var uuid = jQuery(this).hasClass('locked') ? '' : this.getAttribute('x');
            self._jqMapPreviewer[uuid ? 'removeClass' : 'addClass']('locked');
            PubSub.publish('action_preview_map', uuid); 
		});
		
		var jqFlagOrOperators = this._jqLevelListView.find('.flagOrOperator').click(function(e) {
			if (boxman.Runtime.mode == boxman.Definition.RunMode.GAME) {
				PubSub.publish('action_switch_mode', boxman.Definition.RunMode.PLAYER);
				PubSub.publish('action_playback', this.parentNode.getAttribute('x'));
				e.stopPropagation();
			} else if (boxman.Runtime.mode == boxman.Definition.RunMode.MAP){
			    PubSub.publish('action_delete_map', this.parentNode.getAttribute('x'));
			    self.refresh();
			    e.stopPropagation();
			}
		});
	},
	
    generateLevelButtons: function(shownMapUuids, allMapUuids) {
        var str = '';
        var COLS = 4;
        var lastPassedUuids = boxman.Runtime.uuids.record.length > 0 ? boxman.Runtime.uuids.record[boxman.Runtime.uuids.record.length - 1] : '';
        var idxLastPassedUuids = allMapUuids.indexOf(lastPassedUuids);

        for (var i = 0; i < shownMapUuids.length; i++) {
            var mapType = boxman.Runtime.uuids.builtinMap.indexOf(shownMapUuids[i]) != -1 ? 'builtin' : 'customized';
            if (i % COLS == 0) {
                str += '<tr>';
            }
            var isLocked = boxman.Runtime.mode == boxman.Definition.RunMode.GAME  
            				&& boxman.Runtime.uuids.customizedMap.indexOf(shownMapUuids[i]) == -1
            				&& i > (idxLastPassedUuids + 1);
            var isExistRecord = boxman.Runtime.uuids.record.indexOf(shownMapUuids[i]) != -1;
            var classes = 'level';
            classes += ' ' + mapType;
            classes += isLocked ? ' locked' : '';
            classes += !isLocked && isExistRecord ? ' hasRecord' : '';
            
            if (boxman.Runtime.mode == boxman.Definition.RunMode.GAME) {
                this._idxHoveredLevel = idxLastPassedUuids + 1;
                if (this._idxHoveredLevel >= shownMapUuids.length) {
                    this._idxHoveredLevel = shownMapUuids.length - 1;
                }
                classes += this._idxHoveredLevel == i ? ' lastPassed' : '';
            } else {
                this._idxHoveredLevel = 0;
                classes += this._idxHoveredLevel == i ? ' hovered' : '';
            }
            
            var operatorTitle = boxman.Runtime.mode == boxman.Definition.RunMode.GAME ? boxman.nls.resource.levelSelector.tipPlayback : boxman.Runtime.mode == boxman.Definition.RunMode.MAP ? boxman.nls.resource.levelSelector.tipRemoveMap : ''; 
            var shownLevelIdx = boxman.Runtime.mode == boxman.Definition.RunMode.GAME ? (i + 1) : (allMapUuids.indexOf(shownMapUuids[i]) + 1);
            str += '<td><div x="' + shownMapUuids[i] + '" class="' + classes + '">' + (i + 1) + '<a class="flagOrOperator" title="' + operatorTitle + '"></a></div></td>';
            
            if (i % COLS == COLS - 1) {
                str += '</tr>';
            }
        }
        
        var colAlignCnt = COLS - (shownMapUuids.length) % COLS;
        if (colAlignCnt > 0 && colAlignCnt < COLS) {
            for (var i = 0; i < colAlignCnt; i++) {
                str += '<td>&nbsp;</td>';
            }
            str += '</tr>';
        }
        
        return str;
    },
	
	getPreviewCanvasRect: function() {
		return {
			width: this._jqMapPreviewer.width(),
			height: this._jqMapPreviewer.height()
		};
	},
	
	_onChooseLevel: function(uuid) {
	    if (boxman.Runtime.mode == boxman.Definition.RunMode.PLAYER) {
	        PubSub.publish('action_playback', uuid);
	    } else {
	        PubSub.publish('action_load_map', uuid);    
	    }
	}
});