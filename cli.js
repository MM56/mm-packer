#!/usr/bin/env node
'use strict';

var pkg = require('./package.json');
var packImages = require('./index');

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

packImages(process.argv[2], process.argv[3], process.argv[4]);