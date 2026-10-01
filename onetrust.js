// https://github.com/edegagneOptimizely/optimizelyWebX-ProjectJs/tree/main/One%20Trust%20Consent

window.optimizely = window.optimizely || [];    	// Omit if already instantiating in project js

(() => {
	const allowedGroup = 'C0003';					// Change this to the category used for Optimizely consent
	const cookieName = 'OptanonConsent';			// OneTrust consent cookie name, default: OptanonConsent	
	const holdEvents = true;						// Hold events or disable Web X

	const cookies = document.cookie.split(';');
	let cookieValue = '';
	let pushType = '';

	// Get cookie value
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith(cookieName + '=')) {
			cookieValue = cookie.substring(cookieName.length + 1);
			break;
		}
	}

	const decodedcookieValue = decodeURIComponent(cookieValue);
	const keyValuePairs = decodedcookieValue.split('&');
	let consentGroups = null;

	// Extract consent groups from cookie value
	const pair = keyValuePairs.find(pair => pair.startsWith('groups='));
	if (pair) {
		consentGroups = pair.split('=')[1].split(',');
	}

	// Check for consent opt out
	if (consentGroups.indexOf(allowedGroup + ':0') !== -1) {
		if (holdEvents) {
			pushType = "holdEvents";
			console.log('PJS: Optimizely holding events by consent');			
		} else {
			pushType = "disable";
			console.log('PJS: Optimizely disabled by consent');			
		}
	} else {
		if (holdEvents) {
			pushType = "sendEvents";
			console.log('PJS: Optimizely sending events by consent');			
		} else {
			console.log('PJS: Optimizely enabled by consent');
		}
	}

	if (pushType) {
		window["optimizely"].push({
			"type": pushType				
		});
	}
})();