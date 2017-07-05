const cli = require('cli');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');

let debug = false;

function packer(options) {
	if(!options.source) {
		cli.error("No source parameter specified");
		return;
	}
	if(!fs.existsSync(options.source)) {
		cli.error("Source directory \"" + options.source + "\" doesn't exist");
		return;
	}
	if(!options.output) {
		cli.error("No output parameter specified");
		return;
	}
	if(!fs.existsSync(options.output)) {
		cli.error("Output directory \"" + options.output + "\" doesn't exist");
		return;
	}

	const source = addTrailingSlash(options.source);
	const output = addTrailingSlash(options.output);
	const name = options.name || "pack";
	debug = options.debug || false;
	options.mimeTypes = options.mimeTypes || [];
	printDebug("Source: " + source);
	printDebug("Output: " + output);
	printDebug("Name: " + name);

	const files = listFiles(source);
	// printDebug(files);

	pack(files, source, output, name, options.mimeTypes);
}

function addTrailingSlash(str) {
	if(str.substr(-1) == "/") {
		return str;
	}
	return str + "/";
}

function listFiles(dir, fileList = []) {
	const files = fs.readdirSync(dir);
	for(let i = 0, l = files.length; i < l; i++) {
		const file = files[i];
		const currentFile = dir + file;
		if(fs.statSync(currentFile).isDirectory()) {
			listFiles(currentFile + "/", fileList);
		} else if(file.substr(0, 1) != ".") {
			fileList.push(currentFile);
		}
	}
	return fileList;
}

function pack(files, source, output, name, mimeTypes) {
	printDebug("Packing:");
	const buffers = [];
	const datas = [];
	let p = 0;
	for(let i = 0, l = files.length; i < l; i++) {
		const file = files[i];
		printDebug(file);

		const mimetype = resolveMimetype(file, mimeTypes);
		printDebug("- Resolved mime-type: " + mimetype);

		const size = fs.statSync(file)["size"];
		printDebug("- Size: " + size);

		const fileContent = fs.readFileSync(file);
		buffers.push(fileContent);

		datas.push([file.replace(source, ""), p, p + size, mimetype]);

		p += size;
	}
	fs.writeFileSync(output + name + ".pack", Buffer.concat(buffers));
	fs.writeFileSync(output + name + ".json", JSON.stringify(datas));
}

function resolveMimetype(file, mimeTypes) {
	let mimetype = mime.lookup(file);
	if(mimetype) {
		printDebug("- Detected mime-type: " + mimetype);
		mimetype = validateMimetype(mimetype, mimeTypes);
	} else {
		printDebug("- Detected mime-type: None");
		const ext = path.extname(file);
		switch(ext) {
			case ".txt":
			case ".obj":
				mimetype = "text/plain";
				break;
			case ".css":
				mimetype = "text/css";
				break;
			case ".twig":
				mimetype = "text/twig";
				break;
			case ".json":
				mimetype = "application/json";
				break;
			case ".dds":
			case ".pvr":
			case ".glb":
				mimetype = "application/octet-stream";
				break;
			default:
				mimetype = "text/plain";
				break;
		}
	}
	return mimetype;
}

function validateMimetype(mimetype, mimeTypes) {
	const validMimetypes = mimeTypes.concat([
		// Text
		"text/plain",
		// Images
		"image/gif", "image/jpeg", "image/png", "image/tiff", "image/webp",
		// JSON
		"application/json",
		// Twig
		"text/twig",
		// Others non text
		"application/octet-stream"
	]);
	if(validMimetypes.indexOf(mimetype) == -1) {
		return "text/plain";
	} else {
		return mimetype;
	}
}

function printDebug(msg) {
	if(debug) {
		cli.debug(msg);
	}
}

module.exports = packer;

