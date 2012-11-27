boxman.view.home = function() {};

jQuery.extend(boxman.view.home.prototype, {
	
	_me: null,

	_btns: {
		play: {
			cls: 'play',
			handler: '_play',
			obj: null
		},
		playback: {
			cls: 'playback',
			handler: '_playback',
			obj: null
		},
		edit: {
			cls: 'edit',
			handler: '_edit',
			obj: null
		},		
		add: {
			cls: 'add',
			handler: '_add',
			obj: null
		}
	},
	
	_shown: false,
	
	_hoveredBtn: 'play',
	
	init: function(parent) {
		var self = this;
		var html =    '<div class="unifyBorder home">' +
					  '  <div class="buttons">' +
					  '    <button tabindex="1" class="btn play hover spacing">' + boxman.nls.resource.home.play + '</button>' +
					  '    <button tabindex="2" class="btn playback spacing">' + boxman.nls.resource.home.playback + '</button>' +
					  '    <button tabindex="3" class="btn edit spacing">' + boxman.nls.resource.home.edit + '</button>' +
					  '    <button tabindex="4" class="btn add">' + boxman.nls.resource.home.add + '</button>' +
					  '  </div>' +
					  '  <table class="instruction">' +
					  '    <tr class="title1">' +
					  '      <td colspan="2" align="center">' + boxman.nls.resource.home.gameControlInstruction + '</td>' +
					  '    </tr>' +
					  '    <tr class="title2 play">' +
					  '      <td colspan="2">' + boxman.nls.resource.home.gameControlTitle + '</td>' +
					  '    </tr>' +
					  '    <tr>' +
					  '      <td class="col1">' + boxman.nls.resource.home.movePushLabel + '</td>' +
					  '      <td class="col2">' + boxman.nls.resource.home.movePushInstruction + '</td>' +
					  '    </tr>' +
					  '    <tr>' +
					  '      <td class="col1">' + boxman.nls.resource.home.undoRedoLabel + '</td>' +
					  '      <td class="col2">' + boxman.nls.resource.home.undoRedoInstruction + '<br><br></td>' +
					  '    </tr>' +					  
					  '    <tr class="title2 edit">' +
					  '      <td colspan="2">' + boxman.nls.resource.home.mapControlTitle + '</td>' +
					  '    </tr>' +
					  '    <tr>' +
					  '      <td class="col1">' + boxman.nls.resource.home.drawElementLabel + '</td>' +
					  '      <td class="col2">' + boxman.nls.resource.home.drawElementInstruction + '</td>' +
					  '    </tr>' +
					  '    <tr>' +
					  '      <td class="col1">' + boxman.nls.resource.home.eraseElementLabel + '</td>' +
					  '      <td class="col2">' + boxman.nls.resource.home.eraseElementInstruction + '</td>' +
					  '    </tr>' +
					  '  </table>' +
					  '</div>';

		
		self._me = jQuery(html).appendTo(parent);
		for (var key in this._btns) {
			self._btns[key].obj = self._me.find('.' + self._btns[key].cls);
			self._btns[key].handler = eval('self.' + self._btns[key].handler);
			
			self._btns[key].obj.click(function() {
				var matches = /btn (\w+)/.exec(this.getAttribute('class'));
				var keyClsName = matches[1];
				self._btns[keyClsName].handler();
			});
		}
	},
	
	hide: function() {
		this._me.hide();
		this._shown = false;
		if (this._hoveredBtn) {
			this._btns[this._hoveredBtn].obj.removeClass('hover');
			this._hoveredBtn = '';
		}
	},
	
	show: function() {
		this._hoveredBtn = 'play';
		this._me.show();
		this._shown = true;
		this._btns.play.obj.addClass('hover').focus();
	},
	
	_play: function() {
    	PubSub.publish('action_switch_mode', boxman.Definition.RunMode.GAME);
    	PubSub.publish('action_select_level');
	},
	
	_playback: function() {
		PubSub.publish('action_switch_mode', boxman.Definition.RunMode.PLAYER);
		PubSub.publish('action_select_level');
	},

	_edit: function() {
    	PubSub.publish('action_switch_mode', boxman.Definition.RunMode.MAP);
    	PubSub.publish('action_select_level');			
	},
	
	_add: function() {
    	PubSub.publish('action_switch_mode', boxman.Definition.RunMode.MAP);
    	PubSub.publish('action_load_map', -1, 'customized');			
	}	
});