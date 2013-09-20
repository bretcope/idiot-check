
var _idiotUtils = new function ()
{
	var STARTING_CUSTOM_ID = 1001; // give enough room for new default modes

	var _this = this;
	var _modePrefix = /^mode_\d+$/

	/*====================================================================================

	Public Methods - Keep in Alphabetical Order

	====================================================================================*/

	this.createElement = function (tag, parent, className, style, attributes, text)
	{
		var elem = document.createElement(tag);

		var i;
		if (style)
		{
			for (i in style)
			{
				if (typeof style[i] === 'number')
				{
					switch (i)
					{
						case 'top':
						case 'left':
						case 'right':
						case 'bottom':
						case 'margin':
						case 'padding':
							style[i] = style[i] + 'px';
							break;
					}
				}

				elem.style[i] = style[i];
			}
		}

		if (className)
			elem.className = className;

		if (attributes)
		{
			for (i in attributes)
				elem.setAttribute(i, attributes[i]);
		}

		if (text)
			elem.appendChild(document.createTextNode(text));

		if (parent)
			parent.appendChild(elem);

		return elem;
	};

	this.createMode = function ()
	{
		// create a placeholder name for the mode which is unique
		var modes = _this.getModes();

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

		if (localStorage.nextModeId === undefined)
			localStorage.nextModeId = STARTING_CUSTOM_ID;

		var mode = { id: localStorage.nextModeId++, enabled: true, name: name, urls: [], css: '', js: '' };
		_this.saveMode(mode);
		return mode;
	};

	this.deleteMode = function (id)
	{
		if (!localStorage.anySaved)
			saveDefaults();

		delete localStorage['mode_' + id];
	};

	this.getMode = function (id)
	{
		var ls = localStorage['mode_' + id];

		if (ls)
		{
			try
			{
				return JSON.parse(ls);
			}
			catch (ex)
			{
				console.log(ex);
			}
		}

		return getDefaults(id);
	};

	this.getModes = function ()
	{
		var modes = [];
		try
		{
			for (var i in localStorage)
			{
				if (_modePrefix.test(i))
				{
					modes.push(JSON.parse(localStorage[i]));
				}
			}

			if (modes.length)
				return sortModes(modes);
		}
		catch (ex)
		{
			console.log(ex);
		}

		return sortModes(getDefaultModes());
	};

	this.resetAllDefaults = function ()
	{
		for (var i in localStorage)
			delete localStorage[i];

		window.location.reload();
	};

	this.saveMode = function (mode)
	{
		var savedVersion = _this.getMode(mode.id);

		if ((!savedVersion || mode.name !== savedVersion.name) && !verifyUniqueName(mode.id, mode.name))
		{
			mode.name = savedVersion.name;
		}

		// if this is the first time we're saving, we need to save the defaults
		if (!localStorage.anySaved)
			saveDefaults();

		localStorage['mode_' + mode.id] = JSON.stringify(mode);
	};

	/*====================================================================================

	 Private Methods - Keep in Alphabetical Order

	 ====================================================================================*/

	function getDefaultModes ()
	{
		var modes = [];

		var m;
		for (var i = 1; m = getDefaults(i); i++)
		{
			modes.push(m);
		}

		return modes;
	}

	function getDefaults (modeId)
	{
		switch (modeId)
		{
			case 1:
				return {
					id: modeId,
					enabled: true,
					name: 'local',
					urls: ['https?://localhost([:\\/].*)?', 'https?://127.0.0.1[:\\/].*'],
					css: "body {\n    background-image: url(EXTENSION:local.png) !important;\n}",
					js: ''
				};
			case 2:
				return {
					id: modeId,
					enabled:true,
					name: 'dev',
					urls: ['https?://dev\\..*'],
					css: "body {\n    background-image: url(EXTENSION:development.png) !important;\n}",
					js: ''
				};
			case 3:
				return {
					id: modeId,
					enabled:true,
					name: 'production',
					urls: [],
					css: "body {\n    background-image: url(EXTENSION:production.png) !important;\n}",
					js: ''
				};
			default:
				return null;
		}
	}

	function saveDefaults ()
	{
		localStorage.anySaved = true;
		var modes = getDefaultModes();

		for (var i in modes)
		{
			localStorage['mode_' + modes[i].id] = JSON.stringify(modes[i]);
		}
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

	function verifyUniqueName (id, name)
	{
		if (!name)
			return false;

		var modes = _this.getModes();

		for (var i in modes)
		{
			if (modes[i].id != id && modes[i].name == name)
				return false;
		}

		return true;
	}
}();