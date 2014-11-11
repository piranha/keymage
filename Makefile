.PHONY: test

all: keymage.min.js

%.min.js: %.js
	uglifyjs $< > $@

test:
	phantomjs test/phantom.js test/phantom.html
