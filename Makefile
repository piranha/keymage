.PHONY: test

all: keymage.min.js

%.min.js: %.js
	closure-compiler $< > $@

test:
	@PATH=node_modules/.bin:$(PATH) phantomjs test/phantom.js
