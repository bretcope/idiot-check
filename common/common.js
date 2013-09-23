var _idiotCheck = new function ()
{
	// constants
	var STARTING_CUSTOM_ID = 1001; // give enough room for new default modes
	var MODE_PREFIX = "mode_";

	var _this = this;
	var _modeRegex = new RegExp('^' + MODE_PREFIX + '\\d+$');
	
	var _modesCache = null;
	var _modesCacheVersion = 0;

	/*====================================================================================

	 Public Utility Methods - Keep in Alphabetical Order

	 ====================================================================================*/

	this.resetAllDefaults = function ()
	{
		for (var i in localStorage)
			delete localStorage[i];

		window.location.reload();
	};

	/*====================================================================================

	 Mode Class

	 ====================================================================================*/
	
	function Mode ()
	{
		// initialization code for new modes
		//
	}
	
	this.Mode = Mode;

	/*====================================================================================
	 // Default Properties
	 ====================================================================================*/

	Object.defineProperties(Mode.prototype,
	{
		'enabled':{ value:true, writable:true },
		'urls':{
			get:function ()
			{
				if (!this.hasOwnProperty('urls'))
					this.urls = [];

				return this.urls;
			},
			set:function (val)
			{
				if (!this.hasOwnProperty('urls'))
				{
					Object.defineProperty(this, 'urls',
						{
							enumerable:true,
							writable:true
						});
				}

				this.urls = val;
			}
		},
		'css':{ value:'', writable:true },
		'cssInject':{ value:'start', writable:true },
		'js':{ value:'', writable:true },
		'jsInject':{ value:'start', writable:true }
	});

	/*====================================================================================
	 // Static Methods - Keep in Alphabetical Order
	 ====================================================================================*/
	
	Mode.get = function (id)
	{
	};
	
	Mode.getAll = function ()
	{
		if (_modesCache && localStorage.modesCacheVersion == _modesCacheVersion)
			return _modesCache;
		
		var _modesCache = [];
		if (localStorage.anySaved)
		{
			try
			{
				for (var i in localStorage)
				{
					if (_modeRegex.test(i))
					{
						_modesCache.push(JSON.parse(localStorage[i]));
					}
				}
			}
			catch (ex)
			{
				console.log(ex);
			}
		}
		else
		{
			_modesCache = getAllDefaultModes();
		}

		_modesCache = sortModes(_modesCache);
		
		//update the cache version
		if (localStorage.modesCacheVersion)
		{
			_modesCacheVersion = ++localStorage.modesCacheVersion;
			if (_modesCacheVersion > 2000000000)
				localStorage.modesCacheVersion = _modesCacheVersion = 1;
		}
		else
		{
			localStorage.modesCacheVersion = ++_modesCacheVersion;
		}

		return _modesCache;
	};

	function getAllDefaultModes ()
	{
		var modes = [];

		var m;
		for (var i = 1; m = getModeDefaults(i); i++)
		{
			modes.push(m);
		}

		return modes;
	}
	
	function getModeDefaults (modeId)
	{
		var obj = null;
		switch (modeId)
		{
			case 1:
				obj =
				{
					name:'local',
					urls:['https?://localhost([:\\/].*)?', 'https?://127.0.0.1[:\\/].*'],
					css:"body {\n    background-image: url(EXTENSION:local.png) !important;\n}"
				};
				break;
			case 2:
				obj =
				{
					name:'dev',
					urls:['https?://dev\\..*'],
					css:"body {\n    background-image: url(EXTENSION:development.png) !important;\n}",
				};
				break;
			case 3:
				obj = 
				{
					name:'production',
					css:"body {\n    background-image: url(EXTENSION:production.png) !important;\n}"
				};
				break;
			default:
				return null;
		}
		
		obj.id = modeId;
		obj.__proto__ = Mode.prototype;
		
		return obj;
	}

	function saveDefaults ()
	{
		if (localStorage.anySaved)
			return;
		
		localStorage.anySaved = true;
		var modes = getAllDefaultModes();

		for (var i in modes)
			modes[i].save();
	}

	function sortModes (modes)
	{
		return modes.sort(function (a, b)
		{
			if (a.name === b.name)
				return 0;

			return a.name > b.name ? 1 : -1;
		});
	}

	/*====================================================================================
	 // Public Methods - Keep in Alphabetical Order
	 ====================================================================================*/
	
	Mode.prototype.save = function ()
	{
		saveDefaults();
	};
	
	Mode.prototype.delete = function ()
	{
		saveDefaults();
		
		//
	};
	
}();