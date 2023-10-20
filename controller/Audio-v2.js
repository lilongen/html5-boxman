boxman.controller.Audio = function(){};

jQuery.extend(boxman.controller.Audio.prototype, {
init: function(){
		this.initAudio();
		var evtList = ['evt_on_play_audio',
		               		'evt_on_switch_audio',
		               		'action_switch_mode',
		               		'action_load_map',
		               		'action_select_level',
		               		'action_select_record',
		               		'action_play_next',
		               		'action_playback',
		               		'evt_on_history',
		               		'evt_on_back_home',
		               		'evt_on_save_map',
		               		'evt_on_verify_map',
		               		'evt_on_play',
		               		'evt_on_pause',
		               		'evt_on_stop',
		               		'evt_on_select_brush'];
		PubSub.subscribe('evt_on_switch_audio', this, this._switchAudio);
		for(i in evtList){PubSub.subscribe(evtList[i], this, this._playAudio);}
	},
	
	initAudio: function(){
		this.initAudio();
		var evtList = ['evt_on_play_audio',
		               		'evt_on_switch_audio',
		               		'action_switch_mode',
		               		'action_load_map',
		               		'action_select_level',
		               		'action_select_record',
		               		'action_play_next',
		               		'action_playback',
		               		'evt_on_history',
		               		'evt_on_back_home',
		               		'evt_on_save_map',
		               		'evt_on_verify_map',
		               		'evt_on_play',
		               		'evt_on_pause',
		               		'evt_on_stop',
		               		'evt_on_select_brush'];
		PubSub.subscribe('evt_on_switch_audio', this, this._switchAudio);
		for(i in evtList){PubSub.subscribe(evtList[i], this, this._playAudio);}		
		var boxman = $('.boxman');
		var audioList = {
		                 walk: 'walk.wav',	
		                 push: 'push.wav',
		                 bang: 'bang.wav',
		                 click: 'click.wav'};
		for(type in audioList){
			var audioElement = document.createElement('audio');
			boxman.append(audioElement);
			$(audioElement).attr({id: type,
										   src: 'themes/default/audio/'+audioList[type]
										   });
			$('#'+type).addClass('audio audio_on');
			audioElement.load;	
		};
	},
	
	_playAudio: function(evt){
		for(type in audioList){
			var audioElement = document.createElement('audio');
			boxman.append(audioElement);
			$(audioElement).attr({id: type,
										   src: 'themes/default/audio/'+audioList[type]
										   });
			$('#'+type).addClass('audio audio_on');
			audioElement.load;	
		};

		if($('.audio_on').length>0){
			try{
				$('.audio_on'+'#'+evt).get(0).play();
			}catch(e){
				$('.audio_on'+'#click').get(0).play();
			}
		}
	},
	
	_switchAudio: function(){
		if($('.audio_on').length>0){
			$('.audio').removeClass('audio_on');
		}else{
			$('.audio').addClass('audio_on');
		}
	}
});