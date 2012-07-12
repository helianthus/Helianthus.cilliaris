define(function(require)
{

var cilliaris = require('lib/cilliaris');
var status = require('lib/status');

cilliaris.event
.on('settings-change', function(event, settings)
{
	if('autoRedirect' in settings) {
		require('lib/autoredirect')(settings.autoRedirect);
	}

	if('autoRetry' in settings) {
		require('lib/autoretry')(settings.autoRetry);
	}
})
.trigger('settings-change', [cilliaris.settings()]);

status.updateAll();

});
