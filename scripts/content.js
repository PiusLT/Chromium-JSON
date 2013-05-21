try {
	var data = JSON.parse(document.getElementsByTagName('body')[0].innerText)
	process(data)
} catch (e) {
	// Not a JSON.
	// console.error(e)
}

/**
 * Processes data.
 */
function process(data) {
	chrome.extension.sendMessage({
		action: 'process',
		data: data
	}, onResponse)

	function onResponse(response) {
		document.getElementsByTagName('body')[0].innerHTML = wrap(response.data)
	}
}

/**
 * Wraps text with HTML required.
 */
function wrap(text) {
	return '<pre>' + text + '</pre>'
}