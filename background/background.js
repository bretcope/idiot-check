(function ()
{
	var ICON_ENABLED = 'icons/icon-color-19.png';
	var ICON_DISABLED = 'icons/icon-bw-19.png';

	var _tabs = {};

	chrome.tabs.onUpdated.addListener(onUpdate);
	chrome.tabs.onReplaced.addListener(onReplaced);

	chrome.pageAction.onClicked.addListener(onClick);

	function onClick (tab)
	{
		var enabledName = getEnabledKey(tab.id);
		localStorage.idiotCheckEnabled = sessionStorage[enabledName] === 'true' ? 'false' : 'true';
		chrome.tabs.reload(tab.id);
	}

	function onUpdate (tabId, changeInfo, tab)
	{
		if (changeInfo.status === 'loading')
			handleTab(tab);
	}

	function onReplaced (addedTabId, removedTabId)
	{
		chrome.tabs.get(addedTabId, function (tab)
		{
			if (errorHandler())
				return;

			if (_tabs[tab.id] !== tab.url)
				handleTab(tab);
		});
	}

	function handleTab (tab)
	{
		// only care about loading status. Also filter out urls like chrome-extension://
		if (!/^https?:\/\//.test(tab.url))
			return;

		_tabs[tab.id] = tab.url;

		var modes = _idiotUtils.getModes();
		var modesToInject = [];

		var i, mode, reg, isExclude, includeMode;
		for (i in modes)
		{
			mode = modes[i];
			
			if (!mode.enabled)
				continue;
			
			includeMode = false;

			for (var x in mode.urls)
			{
				reg = mode.urls[x];
				if (!reg)
					continue;

				if (reg.charAt(0) === '!')
				{
					reg = reg.substr(1);
					isExclude = true;
				}
				else
				{
					isExclude = false;
				}

				if ((new RegExp('^' + reg + '$', 'i')).test(tab.url))
				{
					if (isExclude)
					{
						includeMode = false;
						break;
					}
					else
					{
						includeMode = true;
					}
				}
			}

			if (includeMode)
				modesToInject.push(mode);
		}

		if (modesToInject.length)
		{
			chrome.pageAction.show(tab.id);

			if (localStorage.idiotCheckEnabled === undefined)
				localStorage.idiotCheckEnabled = 'true';

			var enabledKey = getEnabledKey(tab.id);
			sessionStorage[enabledKey] = localStorage.idiotCheckEnabled;

			if (localStorage.idiotCheckEnabled === 'true')
			{
				chrome.pageAction.setIcon({ tabId: tab.id, path: ICON_ENABLED });

				for (i in modesToInject)
					injectMode(tab.id, modesToInject[i]);
			}
			else
			{
				chrome.pageAction.setIcon({ tabId: tab.id, path: ICON_DISABLED });
			}
		}
	}

	function injectMode (tabId, mode)
	{
		if (mode.css)
		{
			var css = mode.css.replace(/\(EXTENSION:(.*?)\)/g, function (match, path)
			{
				return '(' + JSON.stringify(chrome.extension.getURL('/images/' + path)) + ')';
			});

			chrome.tabs.insertCSS(tabId, { code: css, runAt: 'document_start' }, errorHandler);
		}

		if (mode.js)
			chrome.tabs.executeScript(tabId, { code: mode.js, runAt: 'document_end' }, errorHandler);
	}

	function errorHandler ()
	{
		if (chrome.runtime.lastError)
		{
			console.log(chrome.runtime.lastError);
			return true;
		}

		return false;
	}

	function getEnabledKey (tabId)
	{
		return 'idiot.tab.' + tabId + '.enabled';
	}

})();