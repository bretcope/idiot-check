
$(function ()
{
	var _dom = {};
	var _editors = {};

	var _modes;
	var _mode;
	var _rendering = false;

	function initialize ()
	{
		_dom.left = document.getElementById('Left');
		_dom.resetButton = document.getElementById('ResetButton');
		_dom.createModeButton = document.getElementById('CreateModeButton');
		_dom.content = document.getElementById('Content');
		_dom.editors = document.getElementById('Editors');
		_dom.placeholder = document.getElementById('Placeholder');
		_dom.modeList = document.getElementById('ModeList');
		_dom.labelWrapper = document.getElementById('LabelWrapper');
		_dom.deleteButton = document.getElementById('DeleteButton');
		_dom.labelInput = document.getElementById('LabelInput');
		_dom.urlsInput = document.getElementById('UrlsInput');
//		_dom.cssInjectSelect = document.getElementById('CssInjectSelect');
		_dom.cssInput = document.getElementById('CssInput');
//		_dom.jsInjectSelect = document.getElementById('JsInjectSelect');
		_dom.jsInput = document.getElementById('JsInput');

		_dom.labelInput.addEventListener('change', updateMode);
		_dom.labelInput.addEventListener('keyup', updateMode);
		_dom.labelInput.addEventListener('paste', function () { setTimeout(updateMode, 10); });

		_dom.resetButton.addEventListener('click', function (e)
		{
			e.preventDefault();
			if (confirm("Are you sure you want to erase any custom modes and reset to all defaults?"))
				_idiotUtils.resetAllDefaults();
		});

		_dom.createModeButton.addEventListener('click', function (e)
		{
			e.preventDefault();
			var newMode = _idiotUtils.createMode();
			renderAll(newMode.id);
			_dom.labelInput.focus();
		});

		_dom.deleteButton.addEventListener('click', function (e)
		{
			e.preventDefault();
			if (!_mode)
				return;

			if (confirm("Are you sure you want to delete this mode?"))
			{
				_idiotUtils.deleteMode(_mode.id);
				renderAll();
			}
		});
		
//		_dom.cssInjectSelect.addEventListener('change', updateMode);
//		_dom.jsInjectSelect.addEventListener('change', updateMode);

		var editorWidth = 550;

		_editors.urls = CodeMirror.fromTextArea(_dom.urlsInput, { mode: 'shell', indentUnit: 4, lineNumbers: true });
		_editors.urls.setSize(editorWidth, 140);
		_editors.urls.on('change', updateMode);

		_editors.css = CodeMirror.fromTextArea(_dom.cssInput, { mode: 'css', indentUnit: 4, lineNumbers: true });
		_editors.css.setSize(editorWidth, 400);
		_editors.css.on('change', updateMode);

		_editors.js = CodeMirror.fromTextArea(_dom.jsInput, { mode: 'javascript', indentUnit: 4, lineNumbers: true });
		_editors.js.setSize(editorWidth, 400);
		_editors.js.on('change', updateMode);

		renderAll();
	}

	function setCurrentMode (modeId, e)
	{
		if (e)
			e.preventDefault();

		renderAll(modeId);
	}

	function setLabelIsValid (isValid)
	{
		if (isValid)
			$(_dom.labelWrapper).removeClass('ValidationError');
		else
			$(_dom.labelWrapper).addClass('ValidationError');
	}

	function renderAll (modeId)
	{
		_rendering = true; // prevents the update method from being triggered from the rendering process

		_mode = null;
		_modes = _idiotUtils.getModes();

		if (modeId)
		{
			for (var i in _modes)
			{
				if (_modes[i].id == modeId)
				{
					_mode = _modes[i];
					break;
				}
			}
		}

		renderModeList();
		renderEditors();

		_rendering = false;
	}

	function renderModeList ()
	{
		$(_dom.modeList).empty();

		var a, mode, enableButton, cn, title;
		for (var i = 0; i < _modes.length; i++)
		{
			mode = _modes[i];
			a = _idiotUtils.createElement('a', _dom.modeList, 'Item', null, { href: '' }, mode.name);

			if (_mode && _mode.id == mode.id)
				a.className += ' Selected';
			
			if (mode.enabled)
			{
				cn = 'Enabled';
				title = 'Click to disable this mode.';
			}
			else
			{
				cn = 'Disabled';
				title = 'Click to enable this mode.';
			}
			enableButton = _idiotUtils.createElement('div', a, cn, null, { title: title });
			enableButton.addEventListener('click', toggleEnable.bind(null, mode.id));

			a.addEventListener('click', setCurrentMode.bind(null, mode.id));
		}
	}

	function renderEditors ()
	{
		_dom.editors.style.visibility = _mode ? 'inherit' : 'hidden';
		_dom.placeholder.style.display = _mode ? 'none' : '';

		if (_mode)
		{
			setLabelIsValid(true);
			_dom.labelInput.value = _mode.name;
			_editors.urls.setValue(_mode.urls.join('\n'));
			_editors.css.setValue(_mode.css);
			_editors.js.setValue(_mode.js);
		}
	}
	
	function toggleEnable (modeId, e)
	{
		e.preventDefault();
		e.stopPropagation();
		
		var mode = _idiotUtils.getMode(modeId);
		mode.enabled = !mode.enabled;
		_idiotUtils.saveMode(mode);
		_modes = _idiotUtils.getModes();
		renderModeList();
	}

	function updateMode ()
	{
		if (!_mode || _rendering)
			return;

		_mode.name = _dom.labelInput.value;
		_mode.urls = _editors.urls.getValue().split(/\s*[\r\n]+\s*/);
		_mode.css = _editors.css.getValue();
		_mode.js = _editors.js.getValue();

		_idiotUtils.saveMode(_mode);

		setLabelIsValid(_mode.name == _dom.labelInput.value);
	}

	initialize();

});