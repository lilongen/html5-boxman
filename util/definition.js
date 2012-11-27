boxman.Definition = {
	Map: {
		Data: {
			EMPTY: 0,
			FLOOR: 1,
			WALL: 2,
			DESTINATION: 3,
			BOX: 4,
			MAN: 5
		},
		
		Image: {
			EMPTY		: 'bg.png',
			WALL		: 'wall.bmp',
			FLOOR		: 'floor.bmp',
			DESTINATION	: 'destination.bmp',
			BOX			: 'box.bmp',
			REDAY_BOX	: 'box_in.bmp',
			MAN			: 'man.bmp',
			MAN_DOWN	: 'man_down.bmp',
			MAN_UP		: 'man_up.bmp',
			MAN_LEFT	: 'man_left.bmp',
			MAN_RIGHT	: 'man_right.bmp'
		},
		
		Rect: {
			COLS: 24,
			ROWS: 16,
			GRID_SIDE_LENGTH: 32
		}
	},
	
	RunMode: {
		GAME: 1,
		MAP: 2,
		PLAYER: 3
	},
	
	Ctx: {
		StrokeStyle: {
			Normal: {
				COLOR: '#f0f0f0',				
				WIDTH: 1				
			},
			
			Focus: {
				COLOR: 'rgba(0,255,0,0.8)',
				WIDTH: 1
			}
		},
		
		FillStyle: {
			Normal: {
				COLOR: 'rgba(200,200,200,0)'
			},
			
			Focus: {
				COLOR: 'rgba(0,0,0,0.1)'
			}
		}
	},
	
	KeyCode2Arrow: {
		'37': 'LEFT',
		'38': 'UP',
		'39': 'RIGHT',
		'40': 'DOWN'
	}
};
