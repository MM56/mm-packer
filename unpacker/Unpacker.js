(function(global){

	var Unpacker = (function() {
		var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
		var hasBlob;
		try {
			hasBlob = Boolean(Blob);
		} catch(e) {
			hasBlob = false;
		}
		if (!ArrayBuffer.prototype.slice) {
			//Returns a new ArrayBuffer whose contents are a copy of this ArrayBuffer's
			//bytes from `begin`, inclusive, up to `end`, exclusive
			ArrayBuffer.prototype.slice = function (begin, end) {
				//If `begin` is unspecified, Chrome assumes 0, so we do the same
				if (begin === void 0) {
					begin = 0;
				}

				//If `end` is unspecified, the new ArrayBuffer contains all
				//bytes from `begin` to the end of this ArrayBuffer.
				if (end === void 0) {
					end = this.byteLength;
				}

				//Chrome converts the values to integers via flooring
				begin = Math.floor(begin);
				end = Math.floor(end);

				//If either `begin` or `end` is negative, it refers to an
				//index from the end of the array, as opposed to from the beginning.
				if (begin < 0) {
					begin += this.byteLength;
				}
				if (end < 0) {
					end += this.byteLength;
				}

				//The range specified by the `begin` and `end` values is clamped to the
				//valid index range for the current array.
				begin = Math.min(Math.max(0, begin), this.byteLength);
				end = Math.min(Math.max(0, end), this.byteLength);

				//If the computed length of the new ArrayBuffer would be negative, it
				//is clamped to zero.
				if (end - begin <= 0) {
					return new ArrayBuffer(0);
				}

				var result = new ArrayBuffer(end - begin);
				var resultBytes = new Uint8Array(result);
				var sourceBytes = new Uint8Array(this, begin, end - begin);

				resultBytes.set(sourceBytes);

				return result;
			};
		}

		function b64encodeString(value) {
			var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split("");
			var l = value.length;
			var i = cb = b = bl = v = 0;
			var b0, b1, b2;
			var c0, c1, c2, c3;
			var ret = '';
			// String
			if(typeof value == "string" || value instanceof String){
				while(i < l) {
					b0 = value.charCodeAt(i + 0) & 0xFF;
					b1 = value.charCodeAt(i + 1) & 0xFF;
					b2 = value.charCodeAt(i + 2) & 0xFF;
					c0 = b0 >> 2 & 0x3F;
					c1 = (b0 << 4 | b1 >> 4) & 0x3F;
					c2 = (b1 << 2 | b2 >> 6) & 0x3F;
					c3 = b2 & 0x3F;

					ret += chars[c0] + chars[c1] + chars[c2] + chars[c3];
					i += 3;
				}
			}
			// Array like
			else{
				while(i < l) {
					b0 = value[i + 0] & 0xFF;
					b1 = value[i + 1] & 0xFF;
					b2 = value[i + 2] & 0xFF;
					c0 = b0 >> 2 & 0x3F;
					c1 = (b0 << 4 | b1 >> 4) & 0x3F;
					c2 = (b1 << 2 | b2 >> 6) & 0x3F;
					c3 = b2 & 0x3F;

					ret += chars[c0] + chars[c1] + chars[c2] + chars[c3];
					i += 3;
				}
			}

			i = l % 3;
			l = ret.length;
			if(i == 1) {
				ret = ret.substr(0, l - 2) + "==";
			} else if(i == 2) {
				ret = ret.substr(0, l - 1) + "=";
			}
			return ret;
		}

		function Unpacker(pack, config) {
			if(pack) {
				this._init(pack, config);
			}
		}

		Unpacker.prototype._init = function(pack, config) {
			this.config = config;
			this.pack = pack;
		};
		/**
		 * Get entry media type
		 * @param {String} id
		 * @returns {String}
		 */
		Unpacker.prototype.getType = function(id) {
			return this._findFile(id).type || "text/plain";
		};
		/**
		 * Get entry content as String
		 * Support only ASCII encoding (if pack data is stored as typed array)
		 * @param {String} id
		 * @returns {String}
		 */
		Unpacker.prototype.getAsString = function(id){
			if(this.pack == null) {
				return "";
			}

			var data = this.getData(id);
			if(typeof data == "string" || data instanceof String){
				return data;
			}

			// Read by 65KB chunks
			data = new Uint8Array(data);
			var buffer = "";
			var step = 65535;// 2^16 - 1
			var nbSteps = Math.ceil(data.byteLength / step);
			var offset = 0;
			for(var i = 0; i < nbSteps; i++) {
				buffer += String.fromCharCode.apply(null, new Uint8Array(data.buffer.slice(offset, offset + step)));
				offset += step;
			}
			return buffer;
		};
		/**
		 * Get entry content as URI
		 * @param {String} id
		 * @returns {String} blob URI or data URI
		 */
		Unpacker.prototype.getAsURI = function(id){
			var data = this.getData(id);
			var type = this.getType(id);
			if(hasBlob) {
				return URL.createObjectURL(new Blob([data], { type: type }));
			} else {
				return 'data:' + type + ';base64,' + b64encodeString(data);
			}
		};

		/**
		 * Get entry content as typed array
		 * Support only ASCII decoding (if pack data is stored as string)
		 * @param {String} id
		 * @returns {TypedArray} bytes
		 */
		Unpacker.prototype.getAsBytes = function(id){
			var data = this.getData(id);

			if(typeof data == "string" || data instanceof String){
				if(typeof Uint8Array !== "function"){
					throw new Error("TypedArray are not supported");
				}
				return new Uint8Array(data.split("").map(function(value){return value.charCodeAt(0);}));
			}

			return data;
		};

		/**
		 * Get entry content as same as packer content (string or typed array)
		 * @param {String} name
		 * @return {String|TypedArray}
		 */
		Unpacker.prototype.getData = function(name) {
			var file = this._findFile(name);
			return this._slice(file.begin, file.end);
		};


		/**
		 * Get data between begin and end indexes
		 * @param {Number} begin
		 * @param {Number} end
		 * @return {String|TypedArray}
		 */
		Unpacker.prototype._slice = function(begin, end) {
			if (this.pack == null) {
				return typeof Uint8Array == "function" ? new Uint8Array([]) : "";
			}
			if (typeof this.pack.substr == "function") {
				return this.pack.substr(begin, end - begin);
			}
			return this.pack.slice(begin, end);
		};

		Unpacker.prototype._findFile = function(name) {
			var i = this.config.length;
			while (i-- > 0) {
				if(this.config[i][0] == name)
				{
					var config = this.config[i];
					return {
						name: config[0],
						begin: config[1],
						end: config[2],
						type: config[3]
					};
				}
			}
		};

		return Unpacker;
	})();

	//exports to multiple environments
	if(typeof define === 'function' && define.amd){ //AMD
		define(function () { return Unpacker; });
	} else if (typeof module !== 'undefined' && module.exports){ //node
		module.exports = Unpacker;
	} else { //browser
		//use string because of Google closure compiler ADVANCED_MODE
		/*jslint sub:true */
		global['Unpacker'] = Unpacker;
	}
}(this));
