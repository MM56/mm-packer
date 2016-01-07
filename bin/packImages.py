#!/usr/bin/env python

import os, sys, getopt
import re
import json

def listFiles(path):
	if not path.endswith('/'): path += '/'
	files = os.listdir(path)
	arr = []
	for f in files:
		if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
			arr.append([path + f, f])
		if os.path.isdir(path + '/' + f):
			arr.extend(listFiles(path + f + '/'))
	return arr

def packImages(files, dest, path, filename):

	output = None
	data = []
	p = 0
	c = 0
	for fn in files:
		f = open(fn[0], 'r').read()
		l = len(f)
		mimetype = 'image/'
		if output == None: output = f
		else: output = output + f
		if fn[1][-3:] == 'jpg': mimetype += 'jpeg'
		else: mimetype += fn[1][-3:]
		data.append([fn[0][len(path):], p, p + l, mimetype])
		p += l
		c += 1

	open(dest + filename + '.pack', 'w').write(output)
	open(dest + filename + '.json', 'w').write(json.dumps(data))

def main():
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