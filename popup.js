define(function(require)
{

var bg = chrome.extension.getBackgroundPage();
var cilliaris = bg['require']('lib/cilliaris');
var status = bg['require']('lib/status');
var format = require('lib/format');
var $ = require('lib/jquery');

var writeStatus = function()
{
	var data = status.getSorted(cilliaris.settings('startCol') || 'name');

	var rows = '';
	var url = chrome.tabs.query({ active: true, currentWindow: true }, function(tabs)
	{
		var path = url;

		for(var i=0; i<data.length; i++) {
			rows += format('<tr data-sub="{0.sub}"><td><a href="http://{0.sub}.hkgolden.com/{2}">{0.name}</a></td><td>{1}</td><td class="symbol">{3}</td><td class="symbol"><span class="action" data-action="update" title="更新伺服器資料">&#8634;</span></td></tr>',
				data[i],
				data[i].complete
				? data[i].success
				  ? format('{0: <.3} s', data[i].latency / 1000)
				  : data[i].xhr.status === 200
				    ? data[i].requiresLogin
				      ? '請先登入'
				      : '錯誤頁'
				    : data[i].xhr.statusText || '讀取失敗'
				: '等待中...',
				'topics.aspx?type=BW',
				data[i].success || data[i].requiresLogin
				? data[i].loggedIn
				  ? '<a title="登出" href="http://{0.sub}.hkgolden.com/logout.aspx">&#10004;</a>'
				  : '<a title="前往登入頁" href="http://{0.sub}.hkgolden.com/login.aspx">&#10008;</a>'
				: '<span style="font-weight: bold">?</span>'
			);
		}

		$('#status').html(rows);
	});
};

$(this).on('unload', function()
{
	cilliaris.event.off('.popup');
});

cilliaris.event
.on('status-update.popup', function(event)
{
	writeStatus();
})
.on('status-update-all.popup', function(event)
{
	$('#last-update > span').text(require('lib/prettydate')(status.get().lastUpdate.toISOString()));
});

$('#controls').on('click', 'button[data-action]', function(event)
{
	var action = $(event.target).data('action');

	if(action === 'reload') {
		status.updateAll();
	}
	else if(action === 'settings') {
		$('#settings').fadeToggle('fast');
	}
});

$('#status-headers').on('click', 'th[data-col]', function(event)
{
	cilliaris.settings('startCol', $(event.target).data('col'));
	writeStatus();
});

$('#status').on('click', function(event)
{
	var target = $(event.target);

	if(target.is('a') && event.button < 2) {
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs)
		{
			var url = cilliaris.URL_REGEX.test(tabs[0].url) && tabs[0].url.indexOf('error') === -1 ? cilliaris.normalizeUrl(tabs[0].url, target.closest('tr').data('sub')) : target.attr('href');
			var newtab = tabs[0].pinned || !!cilliaris.settings('newtab');

			if(event.button === 0 && !newtab) {
				chrome.tabs.update(tabs[0].id, {
					url: url
				});
			}
			else {
				chrome.tabs.create({
					url: url,
					active: event.button === 0,
					windowId: tabs[0].windowId,
					index: tabs[0].index + 1
				});
			}
		});

		event.preventDefault();
	}
	else if(target.is('.action')) {
		var action = target.data('action');
		var sub = target.closest('tr').data('sub');

		if(action === 'update') {
			status.updateForum(sub);
		}
	}
});

$('#settings').on('change', 'input', function(event)
{
	cilliaris.settings(event.target.value, event.target.checked);
});

$(function()
{
	cilliaris.event.trigger('status-update-all.popup').trigger('status-update.popup');

	$('#settings input').each(function(i, input)
	{
		var settings = cilliaris.settings();

		if(input.value in settings) {
			input.checked = settings[input.value];
		}
	});
});

});