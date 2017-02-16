#!/usr/bin/env node

const cli = require('cli');
const pkg = require('../package.json');
const packer = require("../index.js");

cli.setApp(pkg.name, pkg.version);
cli.enable("version", "status");
cli.setUsage("mm-packer -s files/original -o files/packed");

cli.parse({
	source:	["s", "Source directory", "file"],
	output:	["o", "Output directory", "file"],
	name:	["n", "Pack files name", "string", "pack"],
});

cli.main((args, options) => {
	if(options.source && options.output && options.name) {
		packer(options);
	} else {
		cli.getUsage();
	}
});
