boxman.view.passedUI = function() {};

jQuery.extend(boxman.view.passedUI.prototype, {
	
	_me: null,
	
	_shown: false,
	
	_hoveredBtn: 'next',

	_btns: {
		play: {
			cls: 'play',
			handler: '_play',
			obj: null,
		},
		next: {
			cls: 'next',
			handler: '_next',
			obj: null
		}
	},
	
	me: function() {
		return this._me;
	},
		
	init: function(parent) {
		var self = this;
		var html = '<div class="unifyBorder passedUI">' +
				   '  <div class="passedInfo">' + boxman.nls.resource.passedUI.passedInfo1 + '<br>' + boxman.nls.resource.passedUI.passedInfo2 + '</div>' +
				   '  <div class="btns">' +
				   '    <button tabindex="11" class="btn play" style="margin-right: 50px;" title="' + boxman.nls.resource.passedUI.tipPlayback + '"></button>' +
				   '    <button tabindex="12" class="btn next hover" title="' + boxman.nls.resource.passedUI.tipNext + '"></button>' +
				   '  </div>' +
				   '</div>';
		
		self._me = jQuery(html).appendTo(parent);
			
		for (var key in this._btns) {
			self._btns[key].obj = self._me.find('.' + self._btns[key].cls);
			self._btns[key].handler = eval('self.' + self._btns[key].handler);
			
			self._btns[key].obj.click(function() {
				self._btns[self._getKeyClsName(this)].handler.call(self);
			}).mouseover(function() {
				var keyClsName = self._getKeyClsName(this);
				if (self._hoveredBtn == keyClsName) {
					return;
				}
				
				self._btns[self._hoveredBtn].obj.removeClass('hover');
				self._btns[keyClsName].obj.addClass('hover').focus();
				self._hoveredBtn = keyClsName;
			});
		}

		this._handleKeydown();
	},
	
	_getKeyClsName: function(dom) {
		var matches = /btn (\w+)/.exec(dom.getAttribute('class'));
		return matches[1];		
	},
	
	_navigateBtnByKeydown: function(pms) {
		var getToIndex = function(currentIdx) {
			var offset = pms.keyCode == 37 ? -1 : 1;
			var toIdx = currentIdx + offset;
			if (toIdx < 0) {
				toIdx = btnKeys.length - 1;	
			}
			if (toIdx > (btnKeys.length - 1)) {
				toIdx = 0;
			}
			
			return toIdx;
		};
		
		var btnKeys = boxman.assistor.keys(pms.btns);
		var currentIdx = btnKeys.indexOf(pms.currentBtn);
		var toIdx = getToIndex(currentIdx);
		pms.btns[btnKeys[currentIdx]].obj.removeClass('hover');
		pms.btns[btnKeys[toIdx]].obj.addClass('hover').focus();
		
		return 	btnKeys[toIdx];
	},	
	
	_handleKeydown: function(escapeExp) {
		var self = this;
		jQuery(document).keydown(function(e) { //document
			if (/*boxman.Runtime.mode != boxman.Definition.RunMode.GAME || */!self._shown) {
				return;
			}
			if (e.shiftKey || e.altKey) {
				return;
			}
			
			if (e.keyCode == 37 || e.keyCode == 39) {
				self._hoveredBtn = self._navigateBtnByKeydown({
					keyCode: e.keyCode,
					btns: self._btns,
					currentBtn: self._hoveredBtn
				});
			}

			return;
		});		
	},
	
	show: function() {
		this._me.show();
		this._shown = true;
		this._btns.next.obj.addClass('hover').focus();
		this._hoveredBtn = 'next';
	},
	
	hide: function() {
		this._me.hide();
		this._shown = false;
		if (this._hoveredBtn) {
			this._btns[this._hoveredBtn].obj.removeClass('hover');
			this._hoveredBtn = '';
		}
	},	
	
	_play: function() {
	    PubSub.publish('action_playback');
	},
	
	_next: function() {
		PubSub.publish('action_play_next');
	}
});