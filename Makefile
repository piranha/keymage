.PHONY: test

PHANTOMJS=node ./node_modules/.bin/phantomjs

all: keymage.min.js

%.min.js: %.js
	closure-compiler $< > $@

test:
	$(PHANTOMJS) test/phantom.js
