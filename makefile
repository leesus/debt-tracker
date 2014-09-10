TESTS = server/test/specs/**/*.js

test:
	mocha --timeout 5000 --reporter dot $(TESTS)

.PHONY: test