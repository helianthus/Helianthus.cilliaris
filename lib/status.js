define(function(require)
{

var cilliaris = require('./cilliaris');
var run = require('./run');
var URI = require('./URI');

var status = {
	lastUpdate: null,
	data: {}
};

chrome.webRequest.onBeforeRedirect.addListener(function(details)
{
	if(details.url.indexOf('cilliaris=1') === -1) {
		return;
	}

	var data = status.data[URI(details.url).subdomain()];

	if(details.redirectUrl.indexOf('error') !== -1) {
		data.success = false;
		data.requiresLogin = details.redirectUrl.indexOf('login.aspx') !== -1;
	}
	else {
		data.loggedIn = false;
	}
}, { urls: cilliaris.URL_MATCH, types: ['xmlhttprequest', 'other'] });

var updateForum = function(sub, name)
{
	if(status.data[sub]) {
		status.data[sub].xhr.abort();
	}

	var data = status.data[sub] = {
		sub: sub,
		name: name || status.data[sub].name,
		latency: null,
		latency: null,
		complete: false,
		fail: false
	};

	var xhr = data.xhr = new XMLHttpRequest();

	var runOptions = run('status-update', cilliaris.event.trigger, [cilliaris.event, 'status-update', [status]], 200);

	xhr.onreadystatechange = function()
	{
		if(xhr.readyState === 4) {
			data.latency = +new Date - start;
			data.complete = true;
			data.success = data.success !== false && xhr.status === 200;
			data.loggedIn = data.loggedIn !== false && data.success;
			data.requiresLogin = !!data.requiresLogin;

			run(runOptions);
		}
	};

	xhr.open('HEAD', 'http://' + sub + '.hkgolden.com/topics.aspx?type=BW&cilliaris=1&_=' + $.now());

	var start = +new Date;
	xhr.send(null);
};

var updateAll = function()
{
	chrome.idle.queryState(5 * 60, function(state)
	{
		if(state === 'active') {
			status.lastUpdate = new Date();

			for(var i=1; i<=cilliaris.MAX_FORUM; i++) {
				updateForum('forum' + i, 'Forum ' + i);
			}

			//updateForum('forum101', 'Forum 101');

			cilliaris.event.trigger('status-update-all', [status]);

			run('status-update-all', updateAll, 5 * 1000 * 60);
		}
	});
};

chrome.idle.onStateChanged.addListener(function(state)
{
	if(state === 'active') {
		run('status-update-all', updateAll, 5 * 1000 * 60 - ((new Date) - status.lastUpdate));
	}
});

var getSorted = function(sortCol)
{
	var list = [];

	for(var sub in status.data) {
		list.push(status.data[sub]);
	}

	return list.sort(function(a, b)
	{
		x = a[sortCol];
		y = b[sortCol];

		if(x == y) {
			return 0;
		}

		if(sortCol === 'name') {
			x = parseInt(x.replace(/\D/g, '')) || x;
			y = parseInt(y.replace(/\D/g, '')) || y;
		}
		else if(sortCol === 'latency') {
			if(!a.success || !b.success) {
				if(!a.success === !b.success) {
					return 0;
				}
				else {
					return a.success ? -1 : 1;
				}
			}
		}

		if(!x || !y) {
			return x ? -1 : 1;
		}

		return x > y ? 1 : -1;
	});
};

return {
	get: function()
	{
		return status;
	},
	getSorted: getSorted,
	updateForum: updateForum,
	updateAll: updateAll
};

});
