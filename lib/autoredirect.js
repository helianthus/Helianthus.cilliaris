define(function(require)
{

var cilliaris = require('./cilliaris');
var run = require('./run');
var URI = require('./URI');
var status = require('./status');

var redirect = function(details)
{
	if(details.method !== 'GET' || details.url.indexOf('/login.aspx') !== -1 || details.url.indexOf('/logout.aspx') !== -1) {
		return;
	}

	var list = status.getSorted('latency');
	var loggedInOnly = cilliaris.settings('loggedInOnly');

	for(var i=0; i<list.length; i++) {
		if(loggedInOnly && !list[i].loggedIn) {
			continue;
		}

		if(list[i].complete && !list[i].fail) {
			var match = details.url.match(cilliaris.URL_REGEX);

			if(match && match[1] !== list[i].sub) {
				return { redirectUrl: cilliaris.normalizeUrl(details.url, list[i].sub) };
			}

			break;
		}
	}
};

var autoRedirect = function(enabled)
{
	chrome.webRequest.onBeforeRequest[enabled ? 'addListener' : 'removeListener'](redirect, { urls: cilliaris.URL_MATCH, types: ['main_frame'] }, ['blocking']);
};

return autoRedirect;

});
