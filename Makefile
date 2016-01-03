.PHONY: test

UGLIFYJS=node ./node_modules/.bin/uglifyjs
PHANTOMJS=node ./node_modules/.bin/phantomjs

all: keymage.min.js

%.min.js: %.js
	$(UGLIFYJS) -c sequences --comments='/^\//' $< > $@

test:
	$(PHANTOMJS) test/phantom.js
