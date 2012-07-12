/*!
 * Function Runner
 * Copyright (c) 2010 project.helianthus <http://github.com/helianthus>
 * Licensed under the MIT License. <http://www.opensource.org/licenses/mit-license.php>
 *
 * version: 1.0.0
 */

(function()
{

var cache = {};

var typeMap = {
	'function': 'callback',
	'number': 'delay',
	'string': 'id'
};

var defaultOptions = {
	id: null,
	delay: null,
	callback: null,
	params: [],
	clear: false
};

var guid = 0;

var run = function()
{
	var options = {
		clear: false,
		destory: false
	};

	for(var i=0; i<arguments.length; i++) {
		var arg = arguments[i];
		var type = typeof arg;

		if(arg === null) {
			options.clear = true;
		}
		else if(typeof arg in typeMap) {
			options[typeMap[type]] = arg;
		}
		else if(typeof arg === 'object') {
			if(typeof arg.length === 'number' && '0' in arg) {
				options.params = [].slice.call(arg);
			}
			else {
				for(var name in arg) {
					if(name in defaultOptions) {
						options[name] = arg[name];
					}
				}
			}
		}
	}

	if(!options.id) {
		options.id = ++guid
	}

	if(cache[options.id]) {
		clearTimeout(cache[options.id].timer);

		for(var name in cache[options.id]) {
			cache[options.id][name] = options[name];
		}

		options = cache[options.id];
	}
	else {
		cache[options.id] = options;
	}

	if(options.clear) {
		delete cache[options.id];
		return;
	}

	if(!options.callback) {
		throw new Error('Runner callback is undefined.');
	}

	var callback = function()
	{
		options.destory = true;

		options.callback.apply(options.params ? options.params[0] : options, options.params && [].slice.call(options.params, 1));

		if(cache[options.id] && cache[options.id].destory) {
			delete cache[options.id];
		}
	};

	if(typeof options.delay !== 'number') {
		callback();
	}
	else {
		options.timer = setTimeout(callback, options.delay);
	}

	return options;
};

if(typeof module !== 'undefined' && module.exports) {
	module.exports = run;
}
else if(typeof define === 'function' && define.amd) {
	define(function(){ return run; });
}
else {
	this.run = run;
}

})();
