.PHONY: test

all: keymage.min.js

%.min.js: %.js
	node node_modules/uglify-js/bin/uglifyjs $< > $@

test:
	node ./node_modules/phantomjs/bin/phantomjs test/phantom.js
