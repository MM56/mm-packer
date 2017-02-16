const cli = require('cli');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');

function packer(options) {
	if(!options.source) {
		cli.error("No source parameter specified");
		return;
	}
	if(!options.output) {
		cli.error("No output parameter specified");
		return;
	}

	let source = addTrailingSlash(options.source);
	let output = addTrailingSlash(options.output);
	let name = options.name;
	cli.debug("Source: " + source);
	cli.debug("Output: " + output);
	cli.debug("Name: " + name);

	const files = listFiles(source);
	cli.debug(files);

	pack(files, source, output, name);
}

function addTrailingSlash(str) {
	if(str.substr(-1) == "/") {
		return str;
	}
	return str + "/";
}

function listFiles(dir, fileList = []) {
	let files = fs.readdirSync(dir);
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

function pack(files, source, output, name) {
	cli.debug("Packing:");
	const stream = fs.createWriteStream(output + name + ".pack");
	const datas = [];
	let p = 0;
	for(let i = 0, l = files.length; i < l; i++) {
		const file = files[i];
		cli.debug(file);

		let mimetype = resolveMimetype(file);
		cli.debug("- Resolved mime-type: " + mimetype);

		let size = fs.statSync(file)["size"];
		cli.debug("- Size: " + size);

		let fileContent = fs.readFileSync(file);
		stream.write(fileContent);

		datas.push([file.replace(source, ""), p, p + size, mimetype]);

		p += size;
	}
	stream.end();
	fs.writeFileSync(output + name + ".json", JSON.stringify(datas));
}

function resolveMimetype(file) {
	let mimetype = mime.lookup(file);
	if(mimetype) {
		cli.debug("- Detected mime-type: " + mimetype);
		mimetype = validateMimetype(mimetype);
	} else {
		cli.debug("- Detected mime-type: None");
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
				mimetype = "application/octet-stream";
				break;
			default:
				mimetype = "text/plain";
				break;
		}
	}
	return mimetype;
}

function validateMimetype(mimetype) {
	const validMimetypes = [
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
	];
	if(validMimetypes.indexOf(mimetype) == -1) {
		return "text/plain";
	} else {
		return mimetype;
	}
}

module.exports = packer;

