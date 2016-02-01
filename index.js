'use strict';

var path = require('path');
var execFile = require('child_process').execFileSync;

module.exports = function(srcPath, outputFolder, filename) {
	if(srcPath == null) {
		throw new Error('Missing srcPath');
		return;
	}
	if(outputFolder == null) {
		throw new Error('Missing outputFolder');
		return;
	}
	if(filename == null) {
		throw new Error('Missing filename');
		return;
	}

	var cmd = path.join(__dirname, "bin", 'packImages.py');

	var args = [
		"-p", srcPath,
		"-o", outputFolder,
		"-n", filename
	];

	execFile(cmd, args);
};
