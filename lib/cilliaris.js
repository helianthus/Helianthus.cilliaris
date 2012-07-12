define(function(require)
{

var $ = require('./jquery');
var URI = require('./URI');

var MAX_FORUM = 11;
var URL_REGEX = /^http:\/\/(forum\d+)\.hkgolden\.com/i;
var URL_MATCH = ['http://*.hkgolden.com/*'];

var event = $({});

var settings = function(name, value)
{
	var settings = JSON.parse(localStorage.settings || '{}');

	if(arguments.length < 2) {
		return name ? settings[name] : settings;
	}

	settings[name] = value;
	localStorage.settings = JSON.stringify(settings);

	var updated = {};
	updated[name] = value;

	event.trigger('settings-change', [updated]);
};

var normalizeUrl = function(url, sub)
{
	var url = URI(url);

	if(sub) {
		url = url.subdomain(sub);
	}

	var match = url.filename().match(/topics_([^._]+)/i);

	if(match) {
		url.filename('topics.aspx').addQuery('type', match[1].toUpperCase());
	}

	return url.href();
};

return {
	MAX_FORUM: MAX_FORUM,
	URL_REGEX: URL_REGEX,
	URL_MATCH: URL_MATCH,

	event: event,
	settings: settings,
	normalizeUrl: normalizeUrl
};

});
