define(function(require)
{

var cilliaris = require('./cilliaris');
var run = require('./run');

var retryRunners = {};

var remove = function(tabId)
{
	run(retryRunners[tabId], null);
	delete retryRunners[tabId];
};

var reload = function(tabId)
{
	retryRunners[tabId].delay = retryRunners[tabId].delay * 2 || 10 * 1000;

	chrome.tabs.get(tabId, function(tab)
	{
		if(cilliaris.URL_REGEX.test(tab.url) && tab.status === 'complete') {
			chrome.tabs.reload(tabId);
		}
	});

	run(retryRunners[tabId], remove);
};

var retry = function(details)
{
	if(details.tabId !== -1) {
		if(details.statusCode === 200 || details.statusCode === 302) {
			remove(details.tabId);
		}
		else {
			retryRunners[details.tabId] = run(retryRunners[details.tabId], reload, [null, details.tabId]);
		}
	}
};

var autoRetry = function(enabled) {
	chrome.webRequest.onCompleted[enabled ? 'addListener' : 'removeListener'](retry, { urls: cilliaris.URL_MATCH, types: ['main_frame'] });
}

return autoRetry;

});
