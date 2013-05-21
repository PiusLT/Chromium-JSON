window.addEventListener('load', onLoad)

/**
 * Called when DOM loads.
 */
function onLoad() {
	chrome.storage.sync.get('settings', function(items) {
		onSettings(items.settings)
	})

	initListeners()
}

/**
 * Registers listeners for tracking user actions.
 * 
 */
function initListeners(name) {
	initRadioListeners('indent')
	initRadioListeners('mode')
	initStyleListeners('primary')
	initStyleListeners('name')
	initStyleListeners('string')
	initStyleListeners('number')
	initStyleListeners('boolean')
	initStyleListeners('null')
	initResetListener('reset-button')
}

/**
 * Initializes redio listeners
 * 
 * @param name Radio name.
 */
function initRadioListeners(name) {
	var elements = document.getElementsByName(name)

	for (var i = 0; i < elements.length; ++i) {
		elements[i].addEventListener('click', onRadioClick)
	}

	/**
	 * Called when radio is clicked.
	 */
	function onRadioClick(event) {
		setSetting(event.srcElement.name, event.srcElement.value)
	}
}

/**
 * Initializes style controls listeners.
 * 
 * @param name Style prefix.
 */
function initStyleListeners(name) {
	document.getElementsByName(name + '-style-color')[0].addEventListener('change', onColorChange)
	document.getElementsByName(name + '-style-bold')[0].addEventListener('change', onBoldChange)
	document.getElementsByName(name + '-style-italic')[0].addEventListener('change', onItalicChange)
	document.getElementsByName(name + '-style-underline')[0].addEventListener('change', onUnderlineChange)

	/**
	 * Called when color selected changes.
	 *
	 * @param event Event triggered.
	 */
	function onColorChange(event) {
		setSetting('style.' + name + '.color', event.srcElement.value)
	}

	/**
	 * Called when bold option state changes.
	 *
	 * @param event  Event trigerred.
	 */
	function onBoldChange(event) {
		setSetting('style.' + name + '.bold', event.srcElement.checked)
	}

	/**
	 * Called when italic option state changes.
	 *
	 * @param event  Event trigerred.
	 */
	function onItalicChange(event) {
		setSetting('style.' + name + '.italic', event.srcElement.checked)
	}

	/**
	 * Called when underline option state changes.
	 *
	 * @param event  Event trigerred.
	 */
	function onUnderlineChange(event) {
		setSetting('style.' + name + '.underline', event.srcElement.checked)
	}
}

/**
 * Initializes settings reset listener.
 *
 * @param id Element ID to which listener is added.
 */
function initResetListener(id) {
	var element = document.getElementById(id)
	element.addEventListener('click', onResetClick)

	/**
	 * Called when reset element is clicked.
	 */
	function onResetClick() {
		chrome.extension.sendMessage({
			action: 'reset',
		}, onReset)
	}

	/**
	 * Called when settings reset is done.
	 */
	function onReset() {
		window.location.reload()
	}
}

/**
 * Called when settings are received.
 * 
 * @param settings Settings' object.
 */
function onSettings(settings) {
	console.log('Settings received (see next log message):')
	console.log(settings)

	setRadio('indent', settings.indent)
	setRadio('mode', settings.mode)
	setStyle('primary', settings.style.primary)
	setStyle('name', settings.style.name)
	setStyle('string', settings.style.string)
	setStyle('number', settings.style.number)
	setStyle('boolean', settings.style['boolean'])
	setStyle('null', settings.style['null'])
}

/**
 * Checks radio depending on setting value.
 * 
 * @param name Radio name.
 * @param value Setting value.
 */
function setRadio(name, value) {
	var elements = document.getElementsByName(name)
	for (var i = 0; i < elements.length; ++i) {
		if (elements[i].value == value) {
			elements[i].checked = true
			break
		}
	}
}

/**
 * Sets style controls' values.
 * 
 * @param name Style controls' group name.
 * @param style Style to set.
 */
function setStyle(name, style) {
	document.getElementsByName(name + '-style-color')[0].value = style.color
	document.getElementsByName(name + '-style-bold')[0].checked = style.bold
	document.getElementsByName(name + '-style-italic')[0].checked = style.italic
	document.getElementsByName(name + '-style-underline')[0].checked = style.underline
}

/**
 * Sets setting value.
 * 
 * @param key Setting name. Accepts dot ('.') symbol as a object level separator.
 * @param value Setting value.
 */
function setSetting(key, value) {
	chrome.storage.sync.get('settings', function(items) {
		// Find object to update.
		var subobject = items.settings
		var keys = key.split('.')
		for (var i = 0; i < keys.length - 1; ++i) {
			console.log(items)
			subobject = subobject[keys[i]]
		}
		key = keys[keys.length - 1]

		// Update settings
		subobject[key] = value

		// Set new settings.
		chrome.storage.sync.set(items, function() {
			console.log('Settings updated (see next log message):')
			console.log(items.settings)
		})
	})
}

/**
 * Resets settings.
 */
function resetSettings() {

}