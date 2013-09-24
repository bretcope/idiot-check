var _idiotCheck = {};

/*====================================================================================

 Mode Class

 ====================================================================================*/
	
_idiotCheck.Mode = function ()
{
	// constants
	var STARTING_CUSTOM_ID = 1001; // give enough room for new default modes
	var NEXT_ID_KEY = 'nextId';
	var MODE_PREFIX = 'mode_';
	var CACHE_VERSION_KEY = 'modesCacheVersion';
	var ANY_SAVED_KEY = 'anySaved';
	
	var _modeRegex = new RegExp('^' + MODE_PREFIX + '\\d+$');

	var _modesCache = null;
	var _modesCacheVersion = 0;

	var _saveTimeouts = {};
	
	function Mode ()
	{
		// initialization code for new modes
		this.__private.data = {};

		//generate new ID
		if (localStorage[NEXT_ID_KEY] === undefined)
			localStorage[NEXT_ID_KEY] = STARTING_CUSTOM_ID;

		this.__private.data.id = localStorage[NEXT_ID_KEY]++;
		
		// create a placeholder name for the mode which is unique
		var modes = Mode.getAll();
		
		var prefix = "mode";
		var name;
		for (var i = 1; true; i++)
		{
			name = prefix + i;

			for (var x in modes)
			{
				if (modes[x].name == name)
				{
					name = null;
					break;
				}
			}

			if (name != null)
				break;
		}
		
		this.__private.data.name = name;
		this.save();
	}

	/*====================================================================================
	 // Default Properties
	 ====================================================================================*/
	
	function createGetterSetter (prop, defaultValue)
	{
		var def = {};
		def.get = function ()
		{
			if (this.__private.data[prop] !== undefined || defaultValue === undefined)
				return this.__private.data[prop];
			
			if (typeof defaultValue === 'function')
				return defaultValue();
			
			return defaultValue;
		};
		def.set = function (val)
		{
			if (val !== this[prop])
			{
				this.__private.changes[prop] = val;
				this.queueSave();
			}
		};
		
		Object.defineProperty(Mode.prototype, prop, def);
	}

	Object.defineProperties(Mode.prototype,
	{
		'id': { get: function () { return this.__private.data.id; } },
		'__private': {
			get: function ()
			{
				if (!this.hasOwnProperty('__private'))
					Object.defineProperty(this, '__private', { value: { changes: {} } });

				return this.__private;
			}
		}
	});
	
	createGetterSetter('name');
	createGetterSetter('enabled', true);
	createGetterSetter('urls', function () { return []; });
	createGetterSetter('css', '');
	createGetterSetter('cssInject', 'start');
	createGetterSetter('js', '');
	createGetterSetter('jsInject', 'start');

	/*====================================================================================
	 // Static Methods - Keep in Alphabetical Order
	 ====================================================================================*/
	
	Mode.get = function (id)
	{
		//
	};
	
	Mode.getAll = function ()
	{
		if (_modesCache && localStorage[CACHE_VERSION_KEY] == _modesCacheVersion)
			return _modesCache;
		
		var _modesCache = [];
		if (localStorage[ANY_SAVED_KEY])
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
		if (localStorage[CACHE_VERSION_KEY])
		{
			_modesCacheVersion = ++localStorage[CACHE_VERSION_KEY];
			if (_modesCacheVersion > 2000000000)
				localStorage[CACHE_VERSION_KEY] = _modesCacheVersion = 1;
		}
		else
		{
			localStorage[CACHE_VERSION_KEY] = ++_modesCacheVersion;
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
	
	function modeFromObject (obj)
	{
		var mode = {};
		mode.__proto__ = Mode.prototype;
		mode.__private.data = obj;
		return mode;
	}

	function saveDefaults ()
	{
		if (localStorage[ANY_SAVED_KEY])
			return;
		
		localStorage[ANY_SAVED_KEY] = true;
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

	Mode.prototype.delete = function ()
	{
		saveDefaults();

		delete localStorage[MODE_PREFIX + this.id];
		localStorage[CACHE_VERSION_KEY]++;
	};
	
	Mode.prototype.queueSave = function ()
	{
		if (!_saveTimeouts[this.id])
			_saveTimeouts[this.id] = setTimeout(this.save.bind(this), 0);
	};
	
	Mode.prototype.save = function ()
	{
		if (_saveTimeouts[this.id])
		{
			clearTimeout(_saveTimeouts[this.id]);
			delete _saveTimeouts[this.id];
		}
		
		var validationErrors = this.validateChanges();
		
		var count = 0;
		for (var i in this.__private.changes)
		{
			if (validationErrors[i])
				continue;
			
			count++;
			this.__private.data[i] = this.__private.changes[i];
		}
		
		if (count > 0)
		{
			saveDefaults();
			localStorage[MODE_PREFIX + this.id] = JSON.stringify(this);
			localStorage[CACHE_VERSION_KEY]++;
		}

		return validationErrors;
	};
	
	Mode.prototype.toJSON = function ()
	{
		return this.__private.data;
	};
	
	Mode.prototype.validateChanges = function ()
	{
		var errors = {};
		
		// verify mode has a unique name
		if (this.__private.changes.name !== undefined)
		{
			var name = this.__private.changes.name;
			
			if (!name)
			{
				errors.name = "The name of the mode cannot be blank.";
			}
			else
			{
				var modes = Mode.getAll();

				for (var i in modes)
				{
					if (modes[i].id != this.id && modes[i].name == name)
					{
						errors.name = "This name is already in use by another mode.";
						break;
					}
				}
			}
		}
		
		return errors;
	};
	
	return Mode;
	
}(); // end of Mode class closure

/*====================================================================================

 Utils Class

 ====================================================================================*/

_idiotCheck.Utils = function ()
{
	function Utils ()
	{
	}
	
	/*====================================================================================
	 Public Utility Methods - Keep in Alphabetical Order
	 ====================================================================================*/
	
	Utils.resetAllDefaults = function ()
	{
		for (var i in localStorage)
			delete localStorage[i];
	
		window.location.reload();
	};
	
	return Utils;
	
}(); // end of Utils class closure