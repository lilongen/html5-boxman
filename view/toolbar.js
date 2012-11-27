boxman.view.toolbar = function() {};

jQuery.extend(boxman.view.toolbar.prototype, {
	
	_me: null,
	
	_btns: {
		backHome: {
			cls: 'backHome',
			handler: '_backHome',
			obj: null
		},
		
		undo: {
			cls: 'undo',
			handler: '_undo',
			obj: null
		},
		redo: {
			cls: 'redo',
			handler: '_redo',
			obj: null
		},
		
		play: {
			cls: 'play',
			handler: '_play',
			obj: null
		},
		pause: {
			cls: 'pause',
			handler: '_pause',
			obj: null
		},
		stop: {
			cls: 'stop',
			handler: '_stop',
			obj: null
		},
		next: {
			cls: 'next',
			handler: '_next',
			obj: null
		},
		open: {
			cls: 'open',
			handler: '_open',
			obj: null
		},
		
		man: {
			cls: 'man',
			handler: '_selectBrush',
			obj: null,
			brushKey: 'MAN'
		},
		box: {
			cls: 'box',
			handler: '_selectBrush',
			obj: null,
			brushKey: 'BOX'
		},
		floor: {
			cls: 'floor',
			handler: '_selectBrush',
			obj: null,
			brushKey: 'FLOOR'
		},
		destination: {
			cls: 'destination',
			handler: '_selectBrush',
			obj: null,
			brushKey: 'DESTINATION'
		},
		wall: {
			cls: 'wall',
			handler: '_selectBrush',
			obj: null,
			brushKey: 'WALL'
		},
		verify: {
			cls: 'verify',
			handler: '_verify',
			obj: null
		},
		save: {
			cls: 'save',
			handler: '_save',
			obj: null
		},
		add: {
            cls: 'add',
            handler: '_add',
            obj: null
        }
	},
	
	init: function(parent) {
	    var self = this;
		var html =  
		  '<div class="toolbar" z-index="1">' + 
			'  <div class="typeGame typePlayer typeMap btn backHome" title="' + boxman.nls.resource.toolbar.tipBackHome + '"></div>' +
			
			'  <div class="typeGame btn undo separatorAhead" title="' + boxman.nls.resource.toolbar.tipUndo + '"></div>' +
			'  <div class="typeGame btn redo" title="' + boxman.nls.resource.toolbar.tipRedo + '"></div>' +
			
			'  <div class="typeGame typePlayer btn play separatorAhead" title="' + boxman.nls.resource.toolbar.tipPlay + '"></div>' +
			'  <div class="typeGame typePlayer btn pause" title="' + boxman.nls.resource.toolbar.tipPause + '"></div>' +
			'  <div class="typeGame typePlayer btn stop" title="' + boxman.nls.resource.toolbar.tipStop + '"></div>' +
			'  <div class="typeGame btn next separatorAhead" title="' + boxman.nls.resource.toolbar.tipPlayNext + '"></div>' +
			'  <div class="typePlayer btn open separatorAhead" title="' + boxman.nls.resource.toolbar.tipOpenGamePlayback + '"></div>' +
			
			'  <div class="typeMap btn man separatorAhead"></div>' +
			'  <div class="typeMap btn box"></div>' +
			'  <div class="typeMap btn floor"></div>' +
			'  <div class="typeMap btn destination"></div>' +
			'  <div class="typeMap btn wall"></div>' +
			'  <div class="typeMap btn verify separatorAhead" title="' + boxman.nls.resource.toolbar.tipVerifyMap + '"></div>' +
			'  <div class="typeMap btn save" title="' + boxman.nls.resource.toolbar.tipSaveMap + '"></div>' +		
			'  <div class="typeMap btn add separatorAhead" title="' + boxman.nls.resource.toolbar.tipAddMap + '"></div>' +
			
			'  <div class="typeGame typePlayer typeMap btn empty4FixLayout pressed"></div>' +
		  '</div>';
		  
		this._me = jQuery(html).prependTo(parent);
		for (var key in this._btns) {
			self._btns[key].obj = self._me.find('.' + self._btns[key].cls);
			self._btns[key].handler = eval('self.' + self._btns[key].handler);
			
			self._btns[key].obj.click(function() {
				var matches = /btn (\w+)/.exec(this.getAttribute('class'));
				var btnCls = matches[1];
				self._btns[btnCls].handler.call(self, self._btns[btnCls].brushKey);
				
				if (!self._btns[btnCls].brushKey) {
					self._behaviorClick(this);
				} else {
					self._selectButton(this);	
				}
			});
		}
				
		PubSub.subscribe('action_switch_mode', this, this._switchMode);
	},
	
	_switchMode: function(mode) {
		if (mode == boxman.Definition.RunMode.GAME) {
		    this._showTypeBtns('typeGame');
		} else if (mode == boxman.Definition.RunMode.PLAYER) {
		    this._showTypeBtns('typePlayer');
		} else {
		    this._showTypeBtns('typeMap');
		    this._setDefaultBrush();		    
		}
	},
	
	_setDefaultBrush: function() {
		var defaultKey = 'floor';
		this._selectButton(this._me.find('.' + this._btns[defaultKey].cls)[0]);
		this._selectBrush(this._btns[defaultKey].brushKey);
	},	
	
	_showTypeBtns: function(type) {
	    var filter = '.' + type;
	    this._me.find(filter).show();
	    this._me.find(':not(' + filter + ')').hide();
	},	
	
	hide: function() {
		this._me.hide();
	},
	
	show: function() {
		this._me.show();
	},
	
	_backHome: function() {
		PubSub.publish('evt_on_back_home');
	},
	
	_undo: function() {
		PubSub.publish('evt_on_history', 'UNDO');
	},
	
	_redo: function() {
		PubSub.publish('evt_on_history', 'REDO');
	},

	_open: function() {
		PubSub.publish('action_switch_mode', boxman.Definition.RunMode.PLAYER);
		PubSub.publish('action_select_level');
	},
	
	_play: function() {
		this._ifResponsePlayerOrNext() && PubSub.publish('evt_on_play');
	},
	
	_ifResponsePlayerOrNext: function() {
		if (boxman.Runtime.mode == boxman.Definition.RunMode.GAME) {
			if (!boxman.Runtime.map.isPassed()) {
				return false;
			}
		}
		
		return true;
	},
	
	_pause: function() {
		this._ifResponsePlayerOrNext() && PubSub.publish('evt_on_pause');
	},
	
	_stop: function() {
		this._ifResponsePlayerOrNext() && PubSub.publish('evt_on_stop');
	},
	
	_next: function() {
		this._ifResponsePlayerOrNext() && PubSub.publish('action_play_next');
	},
	
	_behaviorClick: function(dom) {
		jQuery(dom).addClass('pressed');
		setTimeout(function() {
			jQuery(dom).removeClass('pressed');
		}, 200);
	},	
	
	_selectButton: function(btnDom) {
		if (this._selectedBtn) {
			jQuery(this._selectedBtn).removeClass('pressed');
		}			
		
		jQuery(btnDom).addClass('pressed');
		this._selectedBtn = btnDom;			
	},
		
	_selectBrush: function(brushKey) {
		PubSub.publish('evt_on_select_brush', brushKey);
	},
	
	_save: function() {
		PubSub.publish('evt_on_save_map');
	},
	
	_verify: function() {
		PubSub.publish('evt_on_verify_map');
	},
    
    _add: function() {
        PubSub.publish('action_load_map', -1, 'customized');
    }
});
