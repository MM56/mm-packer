'use strict';

var path = require('path');
var execFile = require('child_process').execFileSync;
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

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

	var cmd = path.join(__dirname, "bin", 'packer.py');

	var args = [
		"-p", srcPath,
		"-o", outputFolder,
		"-n", filename
	];
	
	return decoder.write(execFile(cmd, args));
};
