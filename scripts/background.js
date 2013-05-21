chrome.runtime.onInstalled.addListener(onInstalled)
chrome.extension.onMessage.addListener(onMessage)


/**
 * Called when message is received.
 */
function onMessage(request, sender, sendResponse) {
	if (request.action === 'process') {
		chrome.storage.sync.get('settings', function(items) {
			var data = processInput(request.data, items.settings)
			sendResponse(data)
		})
		return true
	} else if (request.action === 'reset') {
		chrome.storage.sync.set({ settings: getDefaultSettings() }, function() {
			sendResponse({ success: true })
		})
		return true
	} else {
		console.log ('Unknown request action: ' + request.action)
		sendResponse(null)
		return false
	}
}


/**
 * Processes input data.
 * 
 * @param data Data object to be stringified.
 * @param settings Application settings.
 * @return Stringified data.
 */
function processInput(data, settings) {
	if (settings.mode == 'simple') {
		return {
			type: 'text/plain',
			data: JSON.stringify(data, true, settings.indent)
		}
	} else if (settings.mode == 'advanced') {
		var text = JSON.stringify(data, true, settings.indent)
		
		// @note If colon is included inside HTML tags,
		// value coloring must be called first.
		text = text.replace(/(.*)/g, getOutputPattern('{PRE}$1{SUF}', settings.style.primary)) // Primary.
		text = text.replace(/(\"[^\"]*\")(\W*:)/g, getOutputPattern('{PRE}$1{SUF}$2', settings.style.name)) // Names.
		text = text.replace(/(:\s*)(\"[^\"]*\")/g, getOutputPattern('$1{PRE}$2{SUF}', settings.style.string)) // Strings.
		text = text.replace(/(:\s*)(\d+)(\.\d+)?/g, getOutputPattern('$1{PRE}$2$3{SUF}', settings.style.number)) // Numbers.
		text = text.replace(/(:\s*)(true|false)/g, getOutputPattern('$1{PRE}$2{SUF}', settings.style['bollean'])) // Booleans.
		text = text.replace(/(:\s*)(null)/g, getOutputPattern('$1{PRE}$2{SUF}', settings.style['null'])) // Nulls.
		return {
			type: 'text/html',
			data: text
		}
	} else {
		console.error('Unkown format setting \'' + settings.mode + '\'')
	}

	/**
	 * Replaces placeholders with HTML tags depending on the style.
	 * 
	 * @param pattern Output pattern with placeholders instead of HTML tags.
	 * @param style Style object that contains information about styling required.
	 */
	function getOutputPattern(pattern, style) {
		var css = ''

		if (style != null) {
			if (style.color) {
				css += 'color:' + style.color + ';'
			}
			if (style.bold) {
				css += 'font-weight:bold;'
			}
			if (style.italic) {
				css += 'font-style:italic;'
			}
			if (style.underline) {
				css += 'text-decoration:underline;'
			}
		}

		if (css.length === 0) {
			pattern = pattern.replace('{PRE}', '')
			pattern = pattern.replace('{SUF}', '')
		} else {
			pattern = pattern.replace('{PRE}', '<span style="' + css + '">')
			pattern = pattern.replace('{SUF}', '</span>')
		}

		return pattern
	}
}

/**
 * Called when application is first installed.
 */
function onInstalled() {
	chrome.storage.sync.get('settings', function(items) {
		var changed = false
		if (items.settings == undefined) {
			items.settings = getDefaultSettings()
			changed = true
		} else {
			changed = checkSettings(items.settings)
		}

		if (changed) {
			chrome.storage.sync.set(items, function() {
				console.log('Settings set to (see next log message):')
				console.log(items.settings)
			})
		}
	})
}

/**
 * Checks settings whether it contains all required fields.
 *
 * @param settings Settings object to check.
 * @return Whether something was changed.
 */
function checkSettings(settings) {
	var changed = false
	var defaultSettings = getDefaultSettings()

	for (key in defaultSettings) {
		if (settings[key] == undefined) {
			console.log ('Adding default \'' + key + '\' value to settings.')
			settings[key] = defaultSettings[key]
			changed = true
		}
	}

	return changed
}

/**
 * Returns a default settings object.
 */
function getDefaultSettings() {
	return {
		mode: 'advanced',
		indent: '\t',
		style: {
			primary: {
				color: '#000000',
				bold: false,
				italic: false,
				underline: false
			},
			name: {
				color: '#ce7b00',
				bold: false,
				italic: false,
				underline: false
			},
			string: {
				color: '#4488aa',
				bold: false,
				italic: false,
				underline: false
			},
			number: {
				color: '#0000ff',
				bold: false,
				italic: false,
				underline: false
			},
			'boolean': {
				color: '#770088',
				bold: false,
				italic: false,
				underline: false
			},
			'null': {
				color: '#770088',
				bold: false,
				italic: false,
				underline: false
			}
		}
	}
}