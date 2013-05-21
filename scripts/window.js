window.addEventListener('load', onLoad)

/**
 * Called when DOM loads.
 */
function onLoad() {
	document.getElementById('menu-item-settings').addEventListener('click', openSettings)
	document.getElementById('menu-item-help').addEventListener('click', openHelp)
	document.getElementById('menu-item-accept').addEventListener('click', onAccept)
	document.getElementById('menu-item-cancel').addEventListener('click', onCancel)
	window.addEventListener('keyup', onKeyUp)

	// Keep menu visible for a while to ensure user notices it's there.
	setTimeout(function() {
		document.getElementById('menu').classList.remove('open')
	}, 500)

	// Set test input.
	/*
	setInput(JSON.stringify({
		"text_var": "This is some nice text",
		"int_var": 99999,
		"float_var": 12.12,
		"null_var": null
	}))
	*/
}

/**
 * Called when user requests to open settings.
 */
function openSettings() {
	chrome.tabs.create({
		url: "settings.html",
		active: true
	})
}

/**
 * Called when user requests to open help.
 */
function openHelp() {
	chrome.tabs.create({
		url: "about.html",
		active: true
	})
}

/**
 * Called when user requests to proccess input.
 */
function onAccept() {
	var element = document.getElementById('output-box')
	if (element.classList.contains('open')) {
		return false
	} else {
		try {
			var data = JSON.parse(getInput())
			chrome.extension.sendMessage({
				action: 'process',
				data: data
			}, onResponse)
		} catch (e) {
			console.error('Parsing error: ' + e.message)
			alert(e.message)
		}
		return true
	}

	function onResponse(response) {
		console.log(response)
		setOutput(response.data, response.type)
		showOutput(true)
	}
}

/**
 * Called when used requests to close the output.
 */
function onCancel() {
	var element = document.getElementById('output-box')
	if (!element.classList.contains('open')) {
		return false;
	} else {
		showOutput(false)
		return true;
	}
}

/**
 * Called when user releases a key.
 * 
 * @param event Key event objct.
 */
function onKeyUp(event) {
	// console.log(event) // Used for debugging.
	switch (event.keyCode) {
	case 27: // Esc.
		if (onCancel()) {
			event.preventDefault()
		}
		break;
	case 13: // Return.
		if (event.ctrlKey && onAccept()) {
			event.preventDefault()
		}
		break;
	}
}

/**
 * Returns input text.
 *
 * @return User input text.
 */
function getInput() {
	return document.getElementById('text-input').value
}

/**
 * Sets whether output is visible.
 * 
 * @param visible Whether output box should be visible.
 */
function showOutput(visible) {
	if (visible) {
		document.getElementById('output-box').classList.add('open')
		document.getElementById('menu-item-accept').classList.add('hidden')
		document.getElementById('menu-item-cancel').classList.remove('hidden')
	} else {
		document.getElementById('output-box').classList.remove('open')
		document.getElementById('menu-item-accept').classList.remove('hidden')
		document.getElementById('menu-item-cancel').classList.add('hidden')
	}
}

/**
 * Sets output.
 *
 * @param value Output value as a string.
 * @param type Output type is a MIME.
 */
function setOutput(value, type) {
	if (type === 'text/plain') {
		document.getElementById('plain-output').classList.remove('hidden')
		document.getElementById('html-output').classList.add('hidden')
		document.getElementById('plain-output').value = value
		document.getElementById('html-output').innerHTML = ''
	} else if (type === 'text/html') {
		document.getElementById('plain-output').classList.add('hidden')
		document.getElementById('html-output').classList.remove('hidden')
		document.getElementById('plain-output').value = ''
		document.getElementById('html-output').innerHTML = '<pre>' + value + '</pre>'
	} else {
		console.error('Invalid output type: \'' + type + '\'')
	}
}

/**
 * Sets input.
 * 
 * @param value Input value as a string.
 */
function setInput(value) {
	document.getElementById('text-input').value = value
}