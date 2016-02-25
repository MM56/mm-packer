#!/usr/bin/env python

import os, sys, getopt
import re
import json
import mimetypes

def listFiles(path):
	if not path.endswith('/'): path += '/'
	files = os.listdir(path)
	arr = []
	for f in files:
		if not f.startswith('.'):
			arr.append([path + f, f])
		if os.path.isdir(path + '/' + f):
			arr.extend(listFiles(path + f + '/'))
	return arr

def replaceMimetype(originalMimetype):
	validMimetypes = [
		# images
		"image/gif", "image/jpeg", "image/png", "image/tiff", "image/webp"
	]
	if originalMimetype in validMimetypes:
		return originalMimetype
	else:
		return "text/plain"

def packImages(files, dest, path, filename):

	output = None
	data = []
	p = 0
	c = 0
	for fn in files:
		f = open(fn[0], 'r').read()
		l = len(f)

		if output == None: output = f
		else: output = output + f

		mimetype = mimetypes.guess_type(fn[0])
		mimetype = mimetype[0]
		mimetype = replaceMimetype(mimetype)
		data.append([fn[0][len(path):], p, p + l, mimetype])

		p += l
		c += 1

	open(dest + filename + '.pack', 'w').write(output)
	open(dest + filename + '.json', 'w').write(json.dumps(data))

def main():

	mimetypes.init()

	path = dest = "."

	try:
		myopts, args = getopt.getopt(sys.argv[1:],"p:o:n:")
	except getopt.GetoptError as e:
		print (str(e))
		print("Usage: %s -p <path> -o <output> -n <filename>" % sys.argv[0])
		sys.exit(2)

	for o, a in myopts:
		if o == '-p':
			path = a
		elif o == '-o':
			dest = a
		elif o == '-n':
			filename = a

	if len(path) > 0 and path[-1] != '/': path = path + '/'
	if len(dest) > 0 and dest[-1] != '/': dest = dest + '/'

	packImages(listFiles(path), dest, path, filename)


if __name__ == "__main__":
	main()