# MM Packer
[![NPM](https://nodei.co/npm/mm-packer.png)](https://www.npmjs.com/package/mm-packer)

## Goal

Minimize HTTP requests.

## How it works

Inspired by [Magipack.js](https://github.com/keitakun/Magipack.js/tree/master), it concatenates any kind of files into a "pack" file coming with JSON file that specifies what files are packed, where they are in the pack bitwise and what type they are.

## Requirements

* node.js

## Dependencies

* [cli](https://www.npmjs.com/package/cli)
* [mime-types](https://www.npmjs.com/package/mime-types)

## Installation
`npm install mm-packer`

## Usage

### CLI

```sh
$ mm-packer -s files/original -o files/packed
```

#### Options

```
  -s, --source FILE      Source directory
  -o, --output FILE      Output directory
  -n, --name [STRING]    Pack files name (Default is pack)
  -k, --no-color         Omit color from output
      --debug            Show debug information
  -v, --version          Display the current version
  -h, --help             Display help and usage details
```

### API

```
const packer = require("mm-packer");
const packerOptions = {
	source: "files/original",
	output: "files/packed",
	name: "pack" // Optional
};
packer(packerOptions);
```

## Example

If you've just downloaded the repository, run :

```sh
$ ./bin/mm-packer.js -s files/original -o files/packed
```

You should see the generated files in [`files/packed`](https://github.com/MM56/mm-packer/tree/master/files/packed).

You can check the pack can be correctly loaded and parsed with the demo in the folder [`unpacker`](https://github.com/MM56/mm-packer/tree/master/unpacker) that uses [`mm-unpacker`](https://www.npmjs.com/package/mm-unpacker).